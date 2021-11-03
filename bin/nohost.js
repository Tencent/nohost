#! /usr/bin/env node

/**
 * Tencent is pleased to support the open source community by making nohost-环境配置与抓包调试平台 available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved. The below software in
 * this distribution may have been modified by THL A29 Limited ("Tencent Modifications").
 * All Tencent Modifications are Copyright (C) THL A29 Limited.
 * nohost-环境配置与抓包调试平台 is licensed under the MIT License except for the third-party components listed below.
 */

/* eslint no-console: "off" */
const program = require('starting');
const path = require('path');
const os = require('os');
const fs = require('fs');
const pkg = require('../package.json');
const util = require('./util');
const plugin = require('./plugin');

const loadModule = require;
const { showUsage, error, warn, info } = util;
const { readConfig, getDefaultDir } = program.cli;
const NOHOST_PATH = path.join(os.homedir() || '~', '.NohostAppData');

process.env.STARTING_DATA_DIR = NOHOST_PATH;
process.env.WHISTLE_PATH = process.env.NOHOST_PATH || NOHOST_PATH;

function showStartupInfo(err, options, debugMode, restart) {
  if (!err || err === true) {
    return showUsage(err, options, restart);
  }
  // 处理端口冲突错误
  if (/listen EADDRINUSE/.test(err)) {
    options = util.formatOptions(options);
    error(`[!] Failed to bind proxy port ${options.host ? `${options.host}:` : ''}${options.port || pkg.port}: The port is already in use`);
    info(`[i] Please check if nohost is already running, you can ${debugMode ? 'stop nohost with `nohost stop` first' : 'restart nohost with `nohost restart`'}`);
    info(`    or if another application is using the port, you can change the port with ${debugMode ? '`nohost run -p newPort`\n' : '`nohost start -p newPort`\n'}`);
  } else if (err.code === 'EACCES' || err.code === 'EPERM') {
    error('[!] Cannot start nohost owned by root');
    info('[i] Try to run command with `sudo`\n');
  }

  error(err.stack ? `Date: ${new Date().toLocaleString()}\n${err.stack}` : err);
}

function checkVersion(ver) {
  if (!ver || typeof ver !== 'string') {
    return;
  }
  const list = ver.split('.');
  if (list[0] > 1 || list[0] === '0') {
    return true;
  }
  return ver === '1.0.0' || ver === '1.0.1';
}

// 设置默认启动参数
program.setConfig({
  main(options) {
    const mainFile = `${path.join(__dirname, '../index.js')}${options.cluster ? '#cluster#' : ''}`;
    if (!fs.existsSync(path.join(NOHOST_PATH, '.startingAppData'))) { // eslint-disable-line
      const { pid, version } = readConfig(mainFile, getDefaultDir());
      if (pid && checkVersion(version)) {
        try {
          process.kill(pid);
        } catch (e) {}
      }
    }
    return mainFile;
  },
  name: 'nohost',
  version: pkg.version,
  runCallback(err, options) {
    if (err) {
      showStartupInfo(err, options, true);
      return;
    }
    showUsage(false, options);
    console.log('Press [Ctrl+C] to stop nohost...');
  },
  startCallback: showStartupInfo,
  restartCallback(err, options) {
    showStartupInfo(err, options, false, true);
  },
  stopCallback(err) {
    if (err === true) {
      info('[i] nohost killed.');
    } else if (err) {
      if (err.code === 'EPERM') {
        util.showKillError();
      } else {
        error(`[!] ${err.message}`);
      }
    } else {
      warn('[!] No running nohost');
    }
  },
});
// 安装插件命令
program
  .command('install')
  .description('Install the plugin');
// 卸载插件命令
program.command('uninstall')
  .description('Uninstall the plugin');

let { argv } = process;
let cmd = argv[2];
const removeItem = (list, name) => {
  const i = list.indexOf(name);
  if (i !== -1) {
    list.splice(i, 1);
  }
};

const isGlobal = (params) => {
  if (params.indexOf('-g') !== -1 || params.indexOf('--global') !== -1) {
    removeItem(params, '-g');
    removeItem(params, '--global');
    return true;
  }
};
// 处理非 starting 内置的命令
if (/^([a-z]{1,2})?uni(nstall)?$/.test(cmd)) {
  argv = Array.prototype.slice.call(argv, 3);
  if (isGlobal(argv)) {
    loadModule('whistle/bin/plugin').uninstall(argv);
  } else {
    plugin.uninstall(argv);
  }
} else if (/^([a-z]{1,2})?i(nstall)?$/.test(cmd)) {
  cmd = `${RegExp.$1 || ''}npm`;
  argv = Array.prototype.slice.call(argv, 3);
  if (isGlobal(argv)) {
    loadModule('whistle/bin/plugin').install(cmd, argv);
  } else {
    plugin.install(cmd, argv);
  }
} else {
  let index = argv.lastIndexOf('-n');
  if (index === -1) {
    index = argv.lastIndexOf('--username');
  }
  if (index === -1) {
    argv.push('--username', '+');
  }
  program
    .option('-p, --port [proxyPort]', 'set the listening port or host:port (8080 by default)', String, undefined)
    .option('-n, --username [username]', 'set the username to admin', String, undefined)
    .option('-w, --password [password]', 'set the password to admin', String, undefined)
    .option('-k, --authKey [authKey]', 'set the authKey to admin', String, undefined)
    .option('-o, --nohostDomain [domain]', 'set the nohost domain (as: nohost.imweb.io,xxx.yyy.com)', String, undefined)
    .option('-a, --account <account>', 'set the account for installing the plugin (all accounts by default)', String, undefined)
    .option('-b, --baseDir <dir>', 'set the configured storage root path', String, undefined)
    .option('-s, --storage <host:port>', 'set the host:port of server to save the request data', String, undefined)
    .option('-M, --mode [mode]', 'set the starting mode (as: prod)', String, undefined)
    .option('-r, --shadowRules [shadowRules]', 'set shadow (default) rules', String, undefined)
    .option('--config [config]', 'set whistle startup config from a local file', String, undefined)
    .option('--cluster [workers]', 'start the proxy cluster', String, undefined);
  if (argv.indexOf('--redirect') !== -1) {
    program.option('--redirect <redirect>', 'redirect sedlect.html & data.html & share.html to new url', String, undefined);
  }
  program.parse(argv);
}
