module.exports = (ctx) => {
  const { pluginRules } = ctx.request.body;
  ctx.accountMgr.setPluginRules(pluginRules);
  ctx.body = { ec: 0 };
};
