
module.exports = (ctx) => {
  ctx.body = { ec: 0, list: ctx.accountMgr.getAllAccounts() };
};
