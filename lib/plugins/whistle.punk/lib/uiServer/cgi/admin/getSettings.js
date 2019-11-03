module.exports = (ctx) => {
  const {
    entryRules,
    jsonDataStr,
    rulesTpl,
    defaultRules,
    testRules,
    pluginRules,
  } = ctx.accountMgr;
  ctx.body = {
    ec: 0,
    jsonData: jsonDataStr,
    authKey: ctx.accountMgr.getAuthKey(),
    entryRules,
    rulesTpl,
    defaultRules,
    testRules,
    pluginRules,
  };
};
