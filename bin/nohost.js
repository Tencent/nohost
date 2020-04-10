#! /usr/bin/env node
/* eslint no-console: "off" */
const program = require('starting');
const path = require('path');
const os = require('os');
const pkg = require('../package.json');
const util = require('./util');
const plugin = require('./plugin');

const { showUsage } = util;
const { error } = util;
const { warn } = util;
const { info } = util;

process.env.STARTING_DATA_DIR = path.join(os.homedir() || '~', '.NohostAppData');

function showStartupInfo(err, options, debugMode, restart) {
  if (!err || err === true) {
    return showUsage(err, options, restart);
  }
  if (/listen EADDRINUSE/.test(err)) {
    error(`[!] Failed to bind proxy port ${options.port || pkg.port}: The port is already in use`);
    info(`[i] Please check if nohost is already running, you can ${debugMode ? 'stop nohost with `nohost stop` first' : 'restart nohost with `nohost restart`'}`);
    info(`    or if another application is using the port, you can change the port with ${debugMode ? '`nohost run -p newPort`\n' : '`nohost start -p newPort`\n'}`);
  } else if (err.code === 'EACCES' || err.code === 'EPERM') {
    error('[!] Cannot start nohost owned by root');
    info('[i] Try to run command with `sudo`\n');
  }

  error(err.stack ? `Date: ${new Date().toLocaleString()}\n${err.stack}` : err);
}

program.setConfig({
  main: path.join(__dirname, '../index.js'),
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

program
  .command('install')
  .description('Install the plugin');

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

if (/^([a-z]{1,2})?uni(nstall)?$/.test(cmd)) {
  plugin.uninstall(Array.prototype.slice.call(argv, 3));
} else if (/^([a-z]{1,2})?i(nstall)?$/.test(cmd)) {
  cmd = `${RegExp.$1 || ''}npm`;
  argv = Array.prototype.slice.call(argv, 3);
  removeItem(argv, '-g');
  removeItem(argv, '--global');
  plugin.install(cmd, argv);
} else {
  program
    .option('-p, --port [proxyPort]', 'set the listening port or host:port (8080 by default)', String, undefined)
    .option('-n, --username [username]', 'set the username to admin', String, undefined)
    .option('-w, --password [password]', 'set the password to admin', String, undefined)
    .option('-o, --nohostDomain [domain]', 'set the nohost domain (as: nohost.oa.com,xxx.yyy.com)', String, undefined)
    .option('-a, --account <account>', 'set the account for installing the plugin (all accounts by default)', String, undefined)
    .parse(argv);
}
