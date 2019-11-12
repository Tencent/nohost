module.exports = (ctx) => {
  const { baseUrl } = ctx.request.query;
  if (/^[\w-]+(?:\.[\w-]+){1,}$/.test(baseUrl)) {
    ctx.accountMgr.setBaseUrl(baseUrl);
  }
  ctx.body = { ec: 0 };
};
