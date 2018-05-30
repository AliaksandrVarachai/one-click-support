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

const bodyParser = require('body-parser');

// storage for the last sent bug report
const report = {
  fields: {},
  files: {},
};

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

app.use(bodyParser.json());

app.use('/api/:id', function(req, res, next) {
  switch (req.params.id) {
    case 'version':
      res.status(200).json('3.0');
      return next();
    // case 'create-report':
    //   const form = new multiparty.Form();
    //   form.parse(req, function(err, { fields }, files) {
    //     if (err) {
    //       res.status(400).json(err);
    //       return next(err);
    //     }
    //     report = {
    //       fields,
    //       files,
    //     };
    //     console.log('report.fields=', report.fields)
    //     res.status(200).json({isSuccess: true});
    //     return next();
    //   });
    //   return;

    case 'create-report-fields': {
      let data = "";
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end', () => {
        console.log('jsonData=', JSON.parse(data));
        res.status(200).json({
          isSuccess: true
        });
        return next();
      });
      return;
    }


      // try {
      //   console.log('request', req);
      //   console.log('request.body', req.body);
      //   report.fields = req;
      // } catch(err) {
      //   res.status(400).json({
      //     isSuccess: false,
      //     message: err,
      //   });
      //   return next(err);
      // }
      // res.status(200).json({
      //   isSuccess: true
      // });
      // return next();

    case 'create-report-files':
      const form = new multiparty.Form();
      form.parse(req, function(err, fields, files) {
        if (err) {
          res.status(400).json({
            isSuccess: false,
            message: err,
          });
          return next(err);
        }
        report.files = files;
        res.status(200).json({
          isSuccess: true
        });
        return next();
      });
      return;

    case 'read-report': {
      if (!report || !report.fields || !report.files) {
        res.status(400).json('No report data');
        return next();
      }
      const jsonReport = {
        fields: report.fields,
        files: (report.files['files[]'] || []).map(file => ({
          originalFilename: file.originalFilename,
          src: blobToBase64Src(fs.readFileSync(file.path))
        }))
      };
      console.log('jsonReport.fields=', jsonReport.fields)
      res.json(jsonReport);
      return next();
    }

    default:
      console.warn(`There is no requested api method "/api/${req.params.id}"`);
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
  host: LOCAL_HOSTNAME,
  port: LOCAL_PORT
}, () => {
  console.log(`Server is launched on https://${LOCAL_HOSTNAME}:${LOCAL_PORT}`);
});
