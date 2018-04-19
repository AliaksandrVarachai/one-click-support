module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-global-import'),
    require('postcss-nested'),
    require('autoprefixer'),
    require('postcss-css-variables'),
    require('postcss-calc'),
    require('cssnano'),
  ]
};
