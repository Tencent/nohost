const path = require('path');
const { fork } = require('pfork');
const { getAdmin, getDomain } = require('../uiServer/storage');
const config = require('../config');

const script = path.join(__dirname, '../whistle/start.js');
const DELAY_TIME = 1000 * 6;
let server;

exports.fork = () => {
  if (!server) {
    const admin = getAdmin();
    server = new Promise((resolve, reject) => fork({
      script,
      username: admin.username,
      password: admin.password,
      debugMode: config.debugMode,
      domain: getDomain(),
      realPort: config.port,
    }, (err, port, child) => {
      if (err) {
        server = null;
        reject(err);
      } else {
        child.once('close', () => {
          server = null;
        });
        server.whistleProcess = child;
        resolve(port);
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
