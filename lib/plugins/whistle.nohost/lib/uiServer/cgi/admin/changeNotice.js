module.exports = (ctx) => {
  const { name, notice } = ctx.request.body;
  if (ctx.accountMgr.changeNotice(name, notice)) {
    ctx.success();
  } else {
    ctx.error();
  }
};
