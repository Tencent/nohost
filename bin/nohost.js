#! /usr/bin/env node
/* eslint no-console: "off" */
const program = require('starting');
const path = require('path');
const os = require('os');
const pkg = require('../package.json');
const util = require('./util');

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
const { argv } = process;
if (argv.indexOf('--reset') === -1) {
  argv.push('--reset', 'none');
}
program
  .option('-p, --port [proxyPort]', 'set the listening port or host:port (8080 by default)', String, undefined)
  .option('-o, --nohostDomain [domain]', 'set the nohost domain (as: nohost.oa.com,xxx.yyy.com)', String, undefined)
  .option('--reset [reset]', 'reset administrator account name and password')
  .parse(argv);
