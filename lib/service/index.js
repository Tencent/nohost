const { fork } = require('pfork');
const script = require('path').join(__dirname, 'server.js');
const cpuNum = require('os').cpus().length;
const getPort = require('../util/getPort');

const WORKERS = [];
const getWorker = () => {
  let promise;
  return () => {
    if (!promise) {
      promise = new Promise((resolve, reject) => {
        getPort((port) => {
          fork({ value: `${port}`, script }, (err, _, child) => {
            if (err) {
              promise = null;
              reject(err);
            } else {
              child.once('close', () => {
                promise = null;
              });
              resolve(port);
            }
          });
        });
      });
    }
    return promise;
  };
};
for (let i = 0; i < cpuNum; i++) {
  WORKERS.push(getWorker());
}
let index = 0;

module.exports = () => {
  const startWorker = WORKERS[index];
  if (++index >= cpuNum) {
    index = 0;
  }
  return startWorker();
};
