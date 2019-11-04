module.exports = (ctx) => {
  const { name, password } = ctx.request.body;
  if (ctx.accountMgr.changePassword(name, password)) {
    ctx.success();
  } else {
    ctx.error();
  }
};
