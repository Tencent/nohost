const os = require('os');

const WORKER_NUM_FROM_ENV = parseInt(process.env.NOHOST_WORKER_NUM, 10);

if (WORKER_NUM_FROM_ENV > 0) {
  module.exports = WORKER_NUM_FROM_ENV;
} else {
  const WORKER_NUM_FROM_MEM = Math.floor(os.totalmem() / (1024 * 1024 * 600)) || 1;
  const WORKER_NUM_FROM_CPU = os.cpus().length * 4;
  module.exports = Math.min(WORKER_NUM_FROM_MEM, WORKER_NUM_FROM_CPU);
}
