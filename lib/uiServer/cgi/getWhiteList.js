
module.exports = (ctx) => {
  ctx.body = ctx.storage.getWhiteList();
};
