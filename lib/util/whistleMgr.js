const path = require('path');
const { fork } = require('pfork');
const { getAdmin, getBaseUrl } = require('../uiServer/storage');

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
      guestName: '-',
      guestPassword: '',
      baseUrl: getBaseUrl(),
    }, (err, port, child) => {
      proc = child;
      if (err) {
        server = null;
      } else {
        child.once('exit', () => {
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
