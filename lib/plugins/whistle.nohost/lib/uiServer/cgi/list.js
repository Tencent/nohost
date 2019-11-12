

module.exports = (ctx) => {
  const curEnv = ctx.envMgr.getEnv(ctx);
  const list = ctx.accountMgr.getAccountList(ctx.request.query.parsed);
  ctx.body = {
    admin: ctx.admin,
    ec: 0,
    baseUrl: ctx.baseUrl,
    curEnv,
    list,
  };
};
