module.exports = (ctx) => {
  const { rulesTpl } = ctx.request.body;
  ctx.accountMgr.setRulesTpl(rulesTpl);
  ctx.body = { ec: 0 };
};
