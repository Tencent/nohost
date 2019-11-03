module.exports = (ctx) => {
  const { defaultRules } = ctx.request.body;
  ctx.accountMgr.setDefaultRules(defaultRules);
  ctx.body = { ec: 0 };
};
