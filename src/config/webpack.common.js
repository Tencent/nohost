const path = require('path');
/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const rootDir = process.cwd();
const srcDir = path.resolve(rootDir, 'src');
const env = process.argv[process.argv.indexOf('--env') + 1];
const isDev = env === 'dev' || env === 'development';

module.exports = {
  entry: {
    index: path.resolve(srcDir,'admin/index'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(rootDir, 'public/nohost'),
  },
  resolve: {
    extensions: ['.js', '.jsx', 'json'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          'babel-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader',
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['index'],
      template: path.resolve(srcDir, 'html/template.html'),
    }),
    new HtmlWebpackPlugin({
      filename: 'select.html',
      chunks: ['index'],
      template: path.resolve(srcDir, 'html/select.html'),
    }),
  ],
};
