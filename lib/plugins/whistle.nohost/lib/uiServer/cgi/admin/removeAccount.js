module.exports = (ctx) => {
  const { name } = ctx.request.body;
  if (ctx.accountMgr.removeAccount(name)) {
    ctx.whistleMgr.kill(name);
    ctx.success();
  } else {
    ctx.error();
  }
};
