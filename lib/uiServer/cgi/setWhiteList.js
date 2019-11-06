
module.exports = (ctx) => {
  ctx.storage.setWhiteList(ctx.request.body.whiteList);
  ctx.body = { ec: 0 };
};
