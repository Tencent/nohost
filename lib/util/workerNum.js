const os = require('os');

const WORKER_NUM_FROM_ENV = parseInt(process.env.NOHOST_WORKER_NUM, 10);
const TOW_GB = 1024 * 1024 * 1204 * 2;

if (WORKER_NUM_FROM_ENV > 0) {
  module.exports = WORKER_NUM_FROM_ENV;
} else {
  const WORKER_NUM_FROM_MEM = Math.floor(Math.max(os.totalmem() - TOW_GB, 0) / (1024 * 1024 * 500)) || 1;
  const WORKER_NUM_FROM_CPU = os.cpus().length * 4;
  module.exports = Math.min(WORKER_NUM_FROM_MEM, WORKER_NUM_FROM_CPU);
}
