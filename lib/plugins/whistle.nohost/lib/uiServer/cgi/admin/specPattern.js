module.exports = (ctx) => {
  ctx.accountMgr.setSpecPattern(ctx.request.body.specPattern);
  ctx.body = { ec: 0 };
};
