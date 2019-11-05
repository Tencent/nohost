
module.exports = (ctx) => {
  ctx.storage.setDomainList(ctx.request.body.domain);
  ctx.body = { ec: 0 };
};
