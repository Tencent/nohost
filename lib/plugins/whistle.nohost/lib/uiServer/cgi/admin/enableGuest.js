module.exports = (ctx) => {
  const { enableGuest } = ctx.request.body;
  ctx.accountMgr.enableGuest(!!enableGuest);
  ctx.success();
};
