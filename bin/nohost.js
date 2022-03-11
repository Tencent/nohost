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
const w2 = require('whistle/bin/plugin');
const pkg = require('../package.json');
const util = require('./util');
const plugin = require('./plugin');

const { showUsage, error, warn, info } = util;
const { readConfig, removeConfig, getDefaultDir } = program.cli;

process.env.STARTING_DATA_DIR = path.join(os.homedir() || '~', '.NohostAppData');

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
  main() {
    const mainFile = path.join(__dirname, '../index.js');
    const dataDir = getDefaultDir();
    const { pid, version } = readConfig(mainFile, dataDir);
    if (pid && checkVersion(version)) {
      try {
        process.kill(pid);
      } catch (e) {}
      removeConfig(mainFile, dataDir);
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

const parseArgv = (isG) => {
  const { account, args, plugins } = plugin.parseArgv(argv);
  const baseDir = w2.getWhistlePath();
  let dir;
  if (isG) {
    dir = path.join(baseDir, 'nohost_plugins/main_plugins');
  } else {
    dir = path.join(baseDir, `nohost_plugins/${account ? 'account' : 'worker'}_plugins/${account || ''}`);
  }
  return [`--dir=${dir}`].concat(plugins).concat(args);
};

// 处理非 starting 内置的命令
if (/^([a-z]{1,2})?uni(nstall)?$/.test(cmd)) {
  argv = Array.prototype.slice.call(argv, 3);
  const isG = isGlobal(argv);
  if (!isG) {
    plugin.uninstall(argv.slice());
  }
  w2.uninstall(parseArgv(isG));
} else if (/^([a-z]{1,2})?i(nstall)?$/.test(cmd)) {
  cmd = `${RegExp.$1 || ''}npm`;
  argv = Array.prototype.slice.call(argv, 3);
  w2.install(cmd, parseArgv(isGlobal(argv)));
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
    .option('--globalPluginPath [globalPluginPath]', 'set the custom global plugin path (separated by comma)', String, undefined)
    .option('--accountPluginPath [accountPluginPath]', 'set the custom account[worker] plugin path (separated by comma)', String, undefined)
    .option('--config [config]', 'set whistle startup config from a local file', String, undefined)
    .option('--dnsServer [dnsServer]', 'set custom dns servers', String, undefined);

  if (argv.indexOf('--redirect') !== -1) {
    program.option('--redirect <redirect>', 'redirect sedlect.html & data.html & share.html to new url', String, undefined);
  }
  if (argv.indexOf('--workerPluginPath') !== -1) {
    program.option('--workerPluginPath <workerPluginPath>', 'set the custom account[worker] plugin path (separated by comma)', String, undefined);
  }
  program.parse(argv);
}
