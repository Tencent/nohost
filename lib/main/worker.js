const p = require('pfork');
const path = require('path');
const config = require('../config');
const workerNum = require('./workerNum');

const WHISTLE_WORKER = path.join(__dirname, '../plugins/whistle.nohost/lib/whistle.js');
const DELAY = 6000;
const cache = {};

const getName = (index) => {
  if (index > 0) {
    index %= workerNum;
  }
  return `$${index}`;
};

exports.fork = (index) => {
  if (index > 0) {
    index %= workerNum;
  }
  const name = getName(index);
  cache[name] = cache[name] || new Promise((resolve, reject) => {
    p.fork({
      worker: true,
      cluster: config.cluster,
      pluginPaths: config.pluginPaths,
      value: name,
      password: `${Math.random()}`,
      guestName: '-',
      storage: `whistle.nohost/${name}`,
      script: WHISTLE_WORKER,
      storageServer: config.storage,
    }, (err, result, child) => {
      if (err) {
        delete cache[name];
        return reject(err);
      }
      child.on('exit', () => {
        delete cache[name];
      });
      resolve(result.port);
    });
  });
  return cache[name];
};
exports.kill = (index) => {
  p.kill({
    script: WHISTLE_WORKER,
    value: getName(index),
  }, DELAY);
};
