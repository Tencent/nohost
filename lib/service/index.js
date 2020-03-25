const { fork } = require('pfork');
const script = require('path').join(__dirname, 'server.js');
const getPort = require('../util/getPort');

let promise;

module.exports = () => {
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      getPort((port) => {
        fork({ port, script }, (err) => {
          if (err) {
            promise = null;
            return reject(err);
          }
          resolve(port);
        });
      });
    });
  }
  return promise;
};
