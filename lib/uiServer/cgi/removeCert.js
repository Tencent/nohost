
module.exports = async (ctx) => {
  const { filename } = ctx.request.body;
  await ctx.certsMgr.remove(filename);
  ctx.whistleMgr.restart();
  ctx.body = { ec: 0 };
};
