
module.exports = (ctx) => {
  ctx.storage.setDomain(ctx.request.body.domain);
  ctx.body = { ec: 0 };
};
