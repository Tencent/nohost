module.exports = (ctx) => {
  const { entryRules } = ctx.request.body;
  ctx.accountMgr.setEntryRules(entryRules);
  ctx.body = { ec: 0 };
  ctx.updateRules();
};
