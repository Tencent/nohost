module.exports = (ctx) => {
  const {
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
    rulesTpl,
    defaultRules,
    testRules,
    entryPatterns,
  };
};
