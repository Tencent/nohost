
module.exports = (ctx) => {
  ctx.storage.setGuest(ctx.request.body);
  ctx.whistleMgr.restart();
  ctx.body = { ec: 0 };
};
