module.exports = (ctx) => {
  ctx.envMgr.unfollow(ctx);
  ctx.body = { ec: 0 };
};
