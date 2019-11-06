
module.exports = (ctx) => {
  ctx.whistleMgr.stop();
  ctx.body = { ec: 0 };
};
