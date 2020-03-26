const { fork } = require('pfork');
const script = require('path').join(__dirname, 'server.js');
const getPort = require('../util/getPort');

let promise;

module.exports = () => {
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      getPort((port) => {
        fork({ port, script }, (err, _, child) => {
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
