
module.exports = (ctx) => {
  if (ctx.accountMgr.addAccount(ctx.request.body)) {
    ctx.success();
  } else {
    ctx.error();
  }
};
