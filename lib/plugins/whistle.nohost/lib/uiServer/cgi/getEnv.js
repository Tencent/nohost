
const { getClientId } = require('../../util');

module.exports = (ctx) => {
  const curEnv = ctx.envMgr.getEnv(ctx) || null;
  ctx.body = {
    ec: 0,
    curEnv,
    clientIp: ctx.ip,
    clientId: getClientId(ctx),
  };
};
