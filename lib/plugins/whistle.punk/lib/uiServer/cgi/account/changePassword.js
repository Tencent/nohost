module.exports = (ctx) => {
  const { password } = ctx.request.body;
  if (ctx.accountMgr.changePassword(ctx.user.name, password)) {
    ctx.success();
  } else {
    ctx.error();
  }
};
