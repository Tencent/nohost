
module.exports = (ctx) => {
  ctx.whistleMgr.restart();
  ctx.body = { ec: 0 };
};
