const path = require('path');
const { fork } = require('pfork');
const { getAdmin } = require('../uiServer/storage');

const script = path.join(__dirname, 'startWhistle.js');
const DEFALY_TIME = 1000 * 30;
let server;
let proc;
const killServer = () => proc.kill(DEFALY_TIME);

exports.fork = () => {
  if (!server) {
    const admin = getAdmin();
    server = new Promise((resolve, reject) => fork({
      script,
      username: admin.username,
      password: admin.password,
    }, (err, port, child) => {
      proc = child;
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
