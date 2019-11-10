module.exports = (ctx) => {
  const { entryPatterns } = ctx.request.body;
  ctx.accountMgr.setEntryPatterns(entryPatterns);
  ctx.body = { ec: 0 };
  ctx.updateRules();
};
