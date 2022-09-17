const path = require('path');
const { fork } = require('pfork');
const { getAdmin, getDomain } = require('./storage');
const config = require('../config');

const script = path.join(__dirname, '../whistle.js');
const DELAY_TIME = 1000 * 6;
let server;

exports.fork = () => {
  if (!server) {
    const admin = getAdmin();
    server = new Promise((resolve, reject) => fork({
      script,
      baseDir: config.baseDir,
      username: admin.username,
      password: admin.password,
      debugMode: config.debugMode,
      domain: `${getDomain()},${config.domain}`,
      realPort: config.port,
      realHost: config.host || '',
      authKey: config.authKey,
      mainAuthKey: config.mainAuthKey,
      storageServer: config.storage,
      dnsServer: config.dnsServer,
      globalPluginPath: config.globalPluginPath,
      accountPluginPath: config.accountPluginPath,
    }, (err, options, child) => {
      if (err) {
        server = null;
        reject(err);
      } else {
        server.whistleProcess = child;
        child.once('close', () => {
          server = null;
        });
        resolve(options);
      }
    }));
  }
  return server;
};

exports.restart = () => {
  if (server) {
    if (server.whistleProcess) {
      server.whistleProcess.kill(DELAY_TIME);
    } else {
      const svr = server;
      server.then(() => {
        svr.whistleProcess.kill(DELAY_TIME);
      });
    }
    server = null;
  }
};
