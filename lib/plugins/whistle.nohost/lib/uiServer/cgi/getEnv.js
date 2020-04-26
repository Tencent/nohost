

module.exports = (ctx) => {
  const curEnv = ctx.envMgr.getEnv(ctx) || null;
  ctx.body = {
    ec: 0,
    curEnv,
  };
};
