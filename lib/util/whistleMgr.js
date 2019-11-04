const path = require('path');
const { fork } = require('pfork');

const script = path.join(__dirname, 'startWhistle.js');
const DEFALY_TIME = 1000 * 30;
let server;
const killServer = (_, proc) => proc.kill(DEFALY_TIME);

exports.fork = () => {
  if (!server) {
    server = new Promise((resolve, reject) => fork({
      script,
    }, (err, port) => {
      return err ? reject(err) : resolve(port);
    }));
  }
  return server;
};

exports.stop = () => {
  if (server) {
    server.then(killServer);
    server = null;
  }
};
