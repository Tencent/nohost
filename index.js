/**
 * Tencent is pleased to support the open source community by making nohost-环境配置与抓包调试平台 available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved. The below software in
 * this distribution may have been modified by THL A29 Limited ("Tencent Modifications").
 * All Tencent Modifications are Copyright (C) THL A29 Limited.
 * nohost-环境配置与抓包调试平台 is licensed under the MIT License except for the third-party components listed below.
 */

const fse = require('fs-extra');
const fs = require('fs');
const path = require('path');
const { getWhistlePath } = require('whistle/lib/config');
const pkg = require('./package.json');
const initConfig = require('./lib/config');
// 避免第三方模块没处理好异常导致程序crash
require('whistle/lib/util/patch');

const PROD_RE = /(^|\|)prod(uction)?($|\|)/;
// 设置存储路径
process.env.WHISTLE_PATH = process.env.NOHOST_PATH || getWhistlePath();
fse.ensureDirSync(process.env.WHISTLE_PATH); // eslint-disable-line


function getErrorStack(err) {
  if (!err) {
    return '';
  }
  let stack;
  try {
    stack = err.stack;
  } catch (e) {}
  stack = stack || err.message || err;
  const result = [
    `From: nohost@${pkg.version}`,
    `Node: ${process.version}`,
    `Date: ${new Date().toLocaleString()}`,
    stack];
  return result.join('\r\n');
}

const handleUncaughtException = (err) => {
  if (!err || err.code !== 'ERR_IPC_CHANNEL_CLOSED') {
    const stack = getErrorStack(err);
    fs.writeFileSync(path.join(process.cwd(), 'nohost.log'), `\r\n${stack}\r\n`, { flag: 'a' }); // eslint-disable-line
    console.error(stack); // eslint-disable-line
  }
  process.exit(1);
};

process.on('unhandledRejection', handleUncaughtException);
process.on('uncaughtException', handleUncaughtException);

module.exports = (options, cb) => {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  } else if (!options) {
    options = {};
  }
  if (options.debugMode) {
    if (PROD_RE.test(options.mode)) {
      options.debugMode = false;
    } else {
      process.env.PFORK_MODE = 'bind';
    }
  }
  initConfig(options);
  require('./lib')(options, cb); // eslint-disable-line
};
