
module.exports = (ctx) => {
  const { fromName, toName } = ctx.request.body;
  if (ctx.accountMgr.moveAccount(fromName, toName)) {
    ctx.success();
  } else {
    ctx.error();
  }
};
