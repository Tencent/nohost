module.exports = async (ctx) => {
  ctx.body = { ec: 0 };
  if (ctx.storage.setAdmin(ctx.request.body)) {
    ctx.whistleMgr.restart();
  }
};
