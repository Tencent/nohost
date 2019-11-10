
module.exports = (ctx) => {
  const { accountMgr } = ctx;
  ctx.body = {
    ec: 0,
    enableGuest: accountMgr.isEnableGuest(),
    list: accountMgr.getAllAccounts(),
  };
};
