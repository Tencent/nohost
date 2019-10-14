const path = require('path');
const pfork = require('pfork');

const SCRIPT_PATH = path.join(__dirname, 'startWhistle.js');
const DEFALY_TIME = 1000 * 30;
let server;
const killServer = (_, proc) => proc.kill(DEFALY_TIME);

exports.fork = () => {
  server = server || new Promise(resolve => {
    resolve(8888, {});
  });
  return server;
};

exports.stop = () => {
  if (server) {
    server.then(killServer);
    server = null;
  }
};
