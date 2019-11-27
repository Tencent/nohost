
module.exports = async (ctx) => {
  const { filename } = ctx.request.body;
  if (Array.isArray(filename)) {
    await Promise.all(filename.map(ctx.certsMgr.remove));
  } else {
    await ctx.certsMgr.remove(filename);
  }
  ctx.whistleMgr.restart();
  ctx.body = { ec: 0 };
};
