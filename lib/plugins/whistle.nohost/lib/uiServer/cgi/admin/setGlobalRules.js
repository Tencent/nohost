module.exports = (ctx) => {
  const { globalRules } = ctx.request.body;
  ctx.accountMgr.setGlobalRules(globalRules);
  ctx.body = { ec: 0 };
  ctx.updateRules();
};
