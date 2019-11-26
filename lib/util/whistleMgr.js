const path = require('path');
const { fork } = require('pfork');
const { getAdmin, getDomain } = require('../uiServer/storage');
const config = require('../config');

const script = path.join(__dirname, 'startWhistle.js');
const DELAY_TIME = 1000 * 6;
let server;
const killServer = (_, child) => child.kill(DELAY_TIME);

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
      } else {
        child.once('close', () => {
          server = null;
        });
      }
      return err ? reject(err) : resolve(port, child);
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
