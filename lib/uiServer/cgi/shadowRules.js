const { port } = require('../../config');
const { getServerIp } = require('../../util/address');

const RULE = `http://127.0.0.1:${port} enable://capture`;
const setForwardRule = (domain) => {
  return `${domain} ${RULE}`;
};

module.exports = (ctx) => {
  const list = ctx.storage.getDomainList().map(setForwardRule);
  list.push(`//${getServerIp()}:${port} ${RULE}`);
  ctx.body = list.join('\n');
};
