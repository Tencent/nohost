const p = require('pfork');
const path = require('path');
const os = require('os');
const config = require('../config');

const WHISTLE_WORKER = path.join(__dirname, '../plugins/whistle.nohost/lib/whistle');
const WORKER_NUM_FROM_ENV = parseInt(process.env.NOHOST_WORKER_NUM, 10);
const OTHER_APP_MEM = 1024 * 1024 * 1204 * 2;
const DELAY = 6000;
const cache = {};
let workerNum;

if (WORKER_NUM_FROM_ENV > 0) {
  workerNum = WORKER_NUM_FROM_ENV;
} else {
  const WORKER_NUM_FROM_MEM = Math.floor(Math.max(os.totalmem() - OTHER_APP_MEM, 0) / (1024 * 1024 * 500)) || 1;
  const WORKER_NUM_FROM_CPU = os.cpus().length * 4;
  workerNum = Math.min(WORKER_NUM_FROM_MEM, WORKER_NUM_FROM_CPU);
}

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
