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

app.use(cors());

//app.use(bodyParser.json());

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
      res.send(JSON.stringify('3.0'));
      break;
    case 'bug-report':
      const form = new multiparty.Form();
      form.parse(req, function(err, fields, files) {
        report = {
          fields,
          files,
        }
      });
      console.log('******report=', report)
      res.send(JSON.stringify({isSuccess: true}));
      break;
    default:
      console.warn(`There is no requested api method "/api/${req.params.id}"`);
  }
  next();
});

app.use('/test', function(req, res, next) {
  res.writeHead(200, {'content-type': 'text/plain'});
  res.write('received upload:\n\n');
  res.end(report);
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
