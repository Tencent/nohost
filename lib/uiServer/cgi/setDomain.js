
module.exports = async (ctx) => {
  const { domain } = ctx.request.body;
  const { checkDomain, getDomain } = ctx.storage;
  if (checkDomain(domain)) {
    const curDomain = getDomain();
    ctx.storage.setDomain(domain);
    if (curDomain !== domain) {
      ctx.whistleMgr.restart();
    }
  }
  ctx.body = { ec: 0 };
};
