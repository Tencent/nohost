module.exports = (ctx) => {
  const { testRules } = ctx.request.body;
  ctx.accountMgr.setTestRules(testRules);
  ctx.body = { ec: 0 };
};
