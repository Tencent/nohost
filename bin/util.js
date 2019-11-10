const os = require('os');
const colors = require('colors/safe');
const pkg = require('../package.json');

const isWin = process.platform === 'win32';
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
  const port = /^\d+$/.test(options.port) && options.port > 0 ? options.port : pkg.port;
  const list = options.host ? [options.host] : getIpList();
  info(`[i] 1. use your device to visit the following URL list, gets the ${colors.bold('IP')} of the URL you can access:`);
  info(list.map((ip) => {
    return `       http://${colors.bold(ip)}${port ? `:${port}` : ''}/`;
  }).join('\n'));

  warn('       Note: If all the above URLs are unable to access, check the firewall settings');
  warn(`             For help see ${colors.bold('https://github.com/nohosts/nohosts')}`);
  info(`[i] 2. configure your device to use nohost as its HTTP and HTTPS proxy on ${colors.bold('IP:')}${port}`);
  info(`[i] 3. use ${colors.bold('Chrome')} to visit ${colors.bold(`http://${options.localUIHost || pkg.localUIHost}/`)} to get started`);

  if (parseInt(process.version.slice(1), 10) < 6) {
    warn(colors.bold('\nWarning: The current Node version is too low, access https://nodejs.org to install the latest version, or may not be able to intercept HTTPS CONNECTs\n'));
  }
}

exports.showUsage = showUsage;
