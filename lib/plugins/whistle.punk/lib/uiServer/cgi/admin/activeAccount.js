
module.exports = (ctx) => {
  const { name, active } = ctx.request.body;
  if (ctx.accountMgr.activeAccount(name, active !== 'false')) {
    ctx.success();
  } else {
    ctx.error();
  }
};
