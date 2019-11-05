
module.exports = (ctx) => {
  ctx.storage.setToken(ctx.request.body.token);
  ctx.body = { ec: 0 };
};
