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
const { API_SETTINGS, IMAGE_PROXY_PATH, LOCALHOST_SETTINGS } = require('./src/scripts/constants/server');

const app = express();
const config = require('./webpack.config.js')({tool: 'tableau'}, {mode: 'development', hot: true});
const compiler = webpack(config);
const ocsServerKey = fs.readFileSync('./resources/ssl/ocs-server-key.pem');
const ocsServerCert = fs.readFileSync('./resources/ssl/ocs-server-cert.pem');

let report; // stores the last sent bug report

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

app.use(`${API_SETTINGS.PATH}/:id`, function(req, res, next) {
  switch (req.params.id) {
    case 'priorities':
      res.status(200).json([
        {
          id: '6efb921d-421a-41f8-ba49-97747c1e0806',
          name: 'Minor'
        }, {
          id: 'd5f5d723-2388-471a-be29-8af8e1aeda92',
          name: 'Major'
        }, {
          id: 'a87a43ec-f59d-4b50-82cf-d254fe072a21',
          name: 'Blocker'
        }
      ]);
      return next();

    case 'issue':
      const form = new multiparty.Form();
      form.parse(req, function(err, fields, files) {
        if (err) {
          res.status(400).json(err);
          return next(err);
        }
        report = {
          fields: JSON.parse(fields.fields[0]),
          files: files['files'] || [],
        };
        res.status(200).json(null);
        return next();
      });
      return;

    case 'read-report': {
      if (!report || !report.fields || !report.files) {
        res.status(400).json('No report data');
        return next();
      }
      const jsonReport = {
        fields: JSON.stringify(report.fields),
        files: report.files.map(file => ({
          originalFilename: file.originalFilename,
          src: blobToBase64Src(fs.readFileSync(file.path))
        }))
      };
      res.json(jsonReport);
      return next();
    }

    default:
      console.warn(`There is no requested api method "${API_SETTINGS.PATH}/${req.params.id}"`);
      return next();
  }
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
  host: LOCALHOST_SETTINGS.NAME,
  port: LOCALHOST_SETTINGS.PORT
}, () => {
  console.log(`Server is launched on https://${LOCALHOST_SETTINGS.NAME}:${LOCALHOST_SETTINGS.PORT}`);
});
