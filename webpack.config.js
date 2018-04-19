const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const resources = path.resolve(__dirname, 'resources');
const src = path.resolve(__dirname, 'src');
const config = path.resolve(src, 'config');
const dist = path.resolve(__dirname, 'dist-' + process.env.NODE_TOOL);


const polyfills = [
  'whatwg-fetch',
  'babel-polyfill',
];

module.exports = {
  entry: isProduction
    ? {
      'one-click-support': [...polyfills, './src/scripts/index']
    }
    : {
      'local-test-preparation-common': './resources/webpack-dev-server',
      'local-test-preparation': './resources/webpack-dev-server/' + process.env.NODE_TOOL,
      'one-click-support': [...polyfills, './src/scripts/index']
    },
  output: {
    filename: '[name].js',
    path: dist,
    publicPath: '/'
  },
  devtool: isProduction ? false : 'eval',
  plugins: getPlugins(),
  module: {
    rules: [
      {
        test: /\.p?css$/,
        include: src,
        use: [
          {
            loader: 'style-loader'
          }, {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: !isProduction,
              localIdentName: '[name]__[local]--[hash:base64:5]' //must be the same as for react-css-modules
            }
          }, {
            loader: 'postcss-loader'
          }
        ]
      },
      {
        test: /\.html$/,
        include: path.resolve(resources, 'webpack-dev-server'),
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.js$/,
        include: [resources, src],
        use: 'babel-loader'
      }
    ]
  },

  devServer: {
    contentBase: dist,
    port: 9091
  }
};


function getPlugins() {
  return [
    new CleanWebpackPlugin([dist]),
    new webpack.DefinePlugin({
      'process.env.NODE_IS_LOCAL_START': process.env.NODE_IS_LOCAL_START === 'true' ? 'true' : 'false',
    }),
    new UglifyJSPlugin(),
  ];
}
