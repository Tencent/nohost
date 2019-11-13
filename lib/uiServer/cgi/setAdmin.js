module.exports = async (ctx) => {
  ctx.storage.setAdmin(ctx.request.body);
  ctx.body = { ec: 0 };
  ctx.whistleMgr.restart();
};
