
const { BASE_URL } = require('../../util');

module.exports = (ctx) => {
  const curEnv = ctx.envMgr.getEnv(ctx);
  const list = ctx.accountMgr.getAccountList(ctx.request.query.parsed);
  ctx.body = {
    ec: 0, baseUrl: BASE_URL, curEnv, list,
  };
};
