module.exports = (ctx) => {
  ctx.body = { ec: 0, authKey: ctx.accountMgr.getAuthKey() };
};
