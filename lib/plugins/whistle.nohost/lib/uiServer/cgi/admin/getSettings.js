module.exports = (ctx) => {
  const {
    entryRules,
    jsonDataStr,
    rulesTpl,
    defaultRules,
    testRules,
    entryPatterns,
  } = ctx.accountMgr;
  ctx.body = {
    ec: 0,
    jsonData: jsonDataStr,
    authKey: ctx.accountMgr.getAuthKey(),
    entryRules,
    rulesTpl,
    defaultRules,
    testRules,
    entryPatterns,
  };
};
