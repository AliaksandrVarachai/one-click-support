const webpack = require('webpack');
const express = require('express');
const url = require('url');
const cors = require('cors');
const webpackDevMiddleware = require('webpack-dev-middleware');

const proxyRouter = express.Router();
const app = express();
const config = require('./webpack.config.js')({tool: 'tableau'}, {mode: 'development', hot: true});
const compiler = webpack(config);

proxyRouter.get('/', cors(), (req, res, next) => {
  switch (req.query.responseType) {
    case 'blob':
      req.pipe(requrest(req.query.url).on('error', next)).pipe(res);
      break;
    case 'text':
    default:
      request({url: req.query.url, encoding: 'binary'}, (error, response, body) => {
        if (error)
          return next(error);
        res.send(
          `data:${response.headers['content-type']};base64, ${Buffer.from(body, 'bynary').toString('base64')}`
        );
      });
  }
});

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}));

app.use('/', proxyRouter);

app.listen(9091, () => {
  console.log('Server is launched on http://localhost:9091\n');
});
