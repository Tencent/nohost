const { fork } = require('pfork');
const script = require('path').join(__dirname, 'server.js');
const getPort = require('../util/getPort');

const workers = [];
const getCreator = () => {
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

module.exports = (index) => {
  let createServer = workers[index];
  if (!createServer) {
    createServer = getCreator();
    workers[index] = getCreator();
  }
  return createServer();
};
