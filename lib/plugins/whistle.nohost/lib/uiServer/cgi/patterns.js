
module.exports = (ctx) => {
  const { priPatterns, pubPatterns } = ctx.accountMgr;
  ctx.body = {
    ec: 0,
    priPatterns,
    pubPatterns,
  };
};
