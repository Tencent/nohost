
module.exports = (ctx) => {
  ctx.storage.setAdmin(ctx.request.body);
  ctx.whistleMgr.restart();
  ctx.body = { ec: 0 };
};
