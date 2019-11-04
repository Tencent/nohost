module.exports = (ctx) => {
  const { authKey } = ctx.request.body;
  ctx.accountMgr.setAuthKey(authKey);
  ctx.body = { ec: 0 };
};
