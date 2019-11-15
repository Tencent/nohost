
module.exports = (ctx) => {
  const { patterns } = ctx.accountMgr;
  ctx.body = {
    ec: 0,
    patterns,
  };
};
