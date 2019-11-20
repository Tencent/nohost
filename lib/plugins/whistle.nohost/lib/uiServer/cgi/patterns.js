
module.exports = (ctx) => {
  const {
    patterns,
    preRules,
    postRules,
  } = ctx.accountMgr;
  ctx.body = {
    ec: 0,
    patterns,
    preRules,
    postRules,
  };
};
