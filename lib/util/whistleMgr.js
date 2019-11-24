const path = require('path');
const { fork } = require('pfork');
const { getAdmin, getBaseUrl } = require('../uiServer/storage');
const config = require('../config');

const script = path.join(__dirname, 'startWhistle.js');
const DELAY_TIME = 1000 * 30;
let server;
let proc;
const killServer = () => proc.kill(DELAY_TIME);

exports.fork = () => {
  if (!server) {
    const admin = getAdmin();
    server = new Promise((resolve, reject) => fork({
      script,
      username: admin.username,
      password: admin.password,
      debugMode: config.debugMode,
      baseUrl: getBaseUrl(),
      realPort: config.port,
    }, (err, port, child) => {
      proc = child;
      if (err) {
        server = null;
      } else {
        child.once('close', () => {
          server = null;
        });
      }
      return err ? reject(err) : resolve(port);
    }));
  }
  return server;
};

exports.restart = () => {
  if (server) {
    server.then(killServer);
    server = null;
  }
};
