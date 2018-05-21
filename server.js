const webpack = require('webpack');
const express = require('express');
const multiparty = require('multiparty');
const fs = require('fs');
const https = require('https');
const request = require('request');
const url = require('url');
const cors = require('cors');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const { IMAGE_PROXY_PATH, LOCAL_HOSTNAME, LOCAL_PORT } = require('./src/scripts/constants/server');

const app = express();
const config = require('./webpack.config.js')({tool: 'tableau'}, {mode: 'development', hot: true});
const compiler = webpack(config);
const ocsServerKey = fs.readFileSync('./resources/ssl/ocs-server-key.pem');
const ocsServerCert = fs.readFileSync('./resources/ssl/ocs-server-cert.pem');

let report;

function blobToBase64Src(blob) {
  return 'data:image/png;base64,' + blob.toString('base64');
}

app.use(cors());

// TODO: add a certificate for https://ecsb00100f14.epam.com to fix 'unable to verify the first certificate' error
app.use(`/${IMAGE_PROXY_PATH}`, function(req, res, next) {
  // TODO: validate URL
  if (req.query.url !== undefined) {
    switch (req.query.responseType) {
      case 'blob':
        req.pipe(request(req.query.url).on('error', next)).pipe(res);
        break;
      case 'text':
      default:
        request({url: req.query.url, encoding: 'binary'}, (error, response, body) => {
          if (error)
            return next(error);
          res.send(
            `data:${response.headers['content-type']};base64, ${Buffer.from(body, 'binary').toString('base64')}`
          );
        });
    }
  } else {
    next();
  }
});

app.use('/api/:id', function(req, res, next) {
  switch (req.params.id) {
    case 'version':
      res.status(200).json('3.0');
      return next();
    case 'bug-report':
      const form = new multiparty.Form();
      form.parse(req, function(err, fields, files) {
        if (err) {
          res.status(500).json(err);
          return next(err);
        }
        report = {
          fields,
          files,
        };
        res.status(200).json({isSuccess: true});
        return next();
      });
      return;
    default:
      console.warn(`There is no requested api method "/api/${req.params.id}"`);
      return next();
  }
});

// TODO render a react page on the server side
app.use('/test', function(req, res, next) {
  const { fields: {
    title = ['no data'],
    priority = ['no data'],
    description = ['no data'],
    screenshot = [''],
  },
    files = {}
  } = report || {};
  const { fieldName, originalFilename, path } = files['files[]'][0];
  fs.readFile(path, function(err, data) {
    if (err) throw err;
    let srcBase64 = blobToBase64Src(data);

    const reportDoc = `
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Document</title>
        <style>
          .container {
            width: 1000px;
            margin: 0 auto;
          }
          .header {
            margin: 15px 0;
            text-align: center;
            font-weight: bold;
            font-size: 20px;
          }
          .content {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
          }
          .content th {
            text-transform: uppercase;
            background: whitesmoke;
          }
          .content th, .content td {
            border: 1px solid gray;
            padding: 5px 10px;
          }
          .content tr:first-child th:first-child {
            width: 25%;
          }
          .image {
            max-width: 100%;
          }
          .image-header {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
      <div class="container">
        <div class="header">
          OneClick Support's data
        </div>
        <table class="content">
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>title</td>
            <td>${title[0]}</td>
          </tr>
          <tr>
            <td>priority</td>
            <td>${priority[0]}</td>
          </tr>
          <tr>
            <td>description</td>
            <td>${description[0]}</td>
          </tr>
          <tr>
            <td>screenshot</td>
            <td>
              <img src="${screenshot[0]}" class="image" alt="no screenshot"/>
            </td>
          </tr>
          <tr>
            <td>attachment #1</td>
            <td>
              <div class="image-header">${originalFilename}</div>
              <img src="${srcBase64}" class="image" alt="no attached image"/>
            </td>
          </tr>
        </table>
      </div>
      </body>
      </html>
    `;
    res.send(reportDoc);

    next();
  });
});

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}));

app.use(webpackHotMiddleware(compiler));

https.createServer({
  key: ocsServerKey,
  cert: ocsServerCert,
  rejectUnauthorized: false,
  requestCert: false,
  ca: [ocsServerCert],
}, app).listen({
  host: LOCAL_HOSTNAME,
  port: LOCAL_PORT
}, () => {
  console.log(`Server is launched on https://${LOCAL_HOSTNAME}:${LOCAL_PORT}`);
});
