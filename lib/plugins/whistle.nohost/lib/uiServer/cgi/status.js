const { WORKER_NUM } = require('../../util');

const STATUS = { workerNum: WORKER_NUM };

module.exports = (ctx) => {
  ctx.body = STATUS;
};
