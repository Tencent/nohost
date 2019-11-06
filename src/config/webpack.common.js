const path = require('path');
/* eslint-disable import/no-extraneous-dependencies */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const rootDir = process.cwd();
const srcDir = path.resolve(rootDir, 'src');

module.exports = {
  entry: {
    admin: path.resolve(srcDir, 'admin/index'),
    select: path.resolve(srcDir, 'select/index'),
    capture: path.resolve(srcDir, 'capture/index'),
    network: path.resolve(srcDir, 'admin/network'),
    nohost: path.resolve(srcDir, 'button/index'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(rootDir, 'public'),
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
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
            },
          },
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
  devtool: 'none',
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'admin.html',
      chunks: ['admin'],
      title: 'Nohost -- 管理平台',
      template: path.resolve(srcDir, 'html/admin.html'),
    }),
    new HtmlWebpackPlugin({
      filename: 'select.html',
      chunks: ['select'],
      template: path.resolve(srcDir, 'html/select.html'),
    }),
    new HtmlWebpackPlugin({
      filename: 'capture.html',
      chunks: ['capture'],
      title: 'Nohost -- 抓包调试',
      template: path.resolve(srcDir, 'html/template.html'),
    }),
    new HtmlWebpackPlugin({
      filename: 'network.html',
      chunks: ['network'],
      title: 'Nohost -- 查看数据',
      template: path.resolve(srcDir, 'html/template.html'),
    }),
    new CopyPlugin([
      { from: path.resolve(srcDir, 'assets'), to: path.resolve(rootDir, 'public') },
    ]),
  ],
};
