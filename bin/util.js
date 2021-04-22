/**
 * Tencent is pleased to support the open source community by making nohost-环境配置与抓包调试平台 available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved. The below software in
 * this distribution may have been modified by THL A29 Limited ("Tencent Modifications").
 * All Tencent Modifications are Copyright (C) THL A29 Limited.
 * nohost-环境配置与抓包调试平台 is licensed under the MIT License except for the third-party components listed below.
 */

const os = require('os');
const colors = require('colors/safe');
const pkg = require('../package.json');

const isWin = process.platform === 'win32';

const formatOptions = (options) => {
  if (!options || !/^(?:([\w.-]+):)?([1-9]\d{0,4})$/.test(options.port)) {
    return options;
  }
  options.host = options.host || RegExp.$1;
  options.port = parseInt(RegExp.$2, 10);
  return options;
};

exports.formatOptions = formatOptions;
/* eslint-disable no-console */
function getIpList() {
  const ipList = [];
  const ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach((ifname) => {
    ifaces[ifname].forEach((iface) => {
      if (iface.family === 'IPv4') {
        ipList.push(iface.address);
      }
    });
  });
  const index = ipList.indexOf('127.0.0.1');
  if (index !== -1) {
    ipList.splice(index, 1);
  }
  ipList.unshift('127.0.0.1');
  return ipList;
}

function error(msg) {
  console.log(colors.red(msg));
}

function warn(msg) {
  console.log(colors.yellow(msg));
}

function info(msg) {
  console.log(colors.green(msg));
}
exports.error = error;
exports.warn = warn;
exports.info = info;

function showKillError() {
  error('[!] Cannot kill nohost owned by root');
  info(`[i] Try to run command ${isWin ? 'as an administrator' : 'with `sudo`'}`);
}

exports.showKillError = showKillError;

function showUsage(isRunning, options, restart) {
  if (isRunning) {
    if (restart) {
      showKillError();
    } else {
      warn(`[!] nohost@${pkg.version} is running`);
    }
  } else {
    info(`[i] nohost@${pkg.version}${restart ? ' restarted' : ' started'}`);
  }
  const { host, port } = formatOptions(options);
  const curPort = port ? options.port : pkg.port;
  const list = host ? [host] : getIpList();
  info(`[i] use your device to visit the following URL list, gets the ${colors.bold('IP')} of the URL you can access:`);
  info(list.map((ip) => {
    return `     http://${colors.bold(ip)}${curPort ? `:${curPort}` : ''}/`;
  }).join('\n'));

  warn('     Note: If all the above URLs are unable to access, check the firewall settings');
  warn(`           For help see ${colors.bold('https://nohost.pro/')}`);

  if (parseInt(process.version.slice(1), 10) < 6) {
    // eslint-disable-next-line
    warn(colors.bold('\nWarning: The current Node version is too low, access https://nodejs.org to install the latest version, or may not be able to Capture HTTPS CONNECTs\n'));
  }
}

exports.showUsage = showUsage;
