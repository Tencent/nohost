const p = require('pfork');
const path = require('path');
const config = require('../config');
const workerNum = require('./workerNum');

const WHISTLE_WORKER = path.join(__dirname, '../plugins/whistle.nohost/lib/whistle');
const DELAY = 6000;
const cache = {};

exports.fork = (index) => {
  index %= workerNum;
  if (cache[index]) {
    return cache[index];
  }
  cache[index] = new Promise((resolve, reject) => {
    p.fork({
      worker: true,
      username: index,
      password: `${Math.random()}`,
      guestName: '-',
      storage: `whistle.nohost/$${index}`,
      script: WHISTLE_WORKER,
      storageServer: config.storage,
    }, (err, { port }, child) => {
      if (err) {
        delete cache[index];
        return reject(err);
      }
      child.on('exit', () => {
        delete cache[index];
      });
      resolve(port);
    });
  });
  return cache[index];
};
exports.kill = (name) => {
  p.kill({
    script: WHISTLE_WORKER,
    value: name,
  }, DELAY);
};
