
module.exports = (ctx) => {
  ctx.storage.enableGuest(ctx.request.body.enableGuest === '1');
  ctx.whistleMgr.restart();
  ctx.body = { ec: 0 };
};
