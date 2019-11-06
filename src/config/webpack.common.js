const path = require('path');
/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
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
          {
            loader:'less-loader',
            options:{
              javascriptEnabled:true
            }
          }
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
      template: path.resolve(srcDir, 'assets/html/template.html'),
    }),
    new HtmlWebpackPlugin({
      filename: 'select.html',
      chunks: ['index'],
      template: path.resolve(srcDir, 'assets/html/select.html'),
    }),
    new CopyPlugin([
      {from:path.resolve(srcDir, 'assets'),to:path.resolve(rootDir, 'public')}
    ])
  ],
};
