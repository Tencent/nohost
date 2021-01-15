module.exports = (ctx) => {
  const { rules } = ctx.request.body;
  ctx.accountMgr.setAccountRules(rules);
  ctx.body = { ec: 0 };
};
