
module.exports = (ctx) => {
  ctx.storage.setAdmin(ctx.request.body);
  ctx.body = { ec: 0 };
};
