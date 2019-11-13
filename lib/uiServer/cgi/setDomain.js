const { request } = require('../../util');

module.exports = async (ctx) => {
  const { domain } = ctx.request.body;
  const { checkDomain, getBaseUrl } = ctx.storage;
  if (checkDomain(domain)) {
    const { req } = ctx;
    const baseUrl = getBaseUrl(domain);
    req.url = `/plugin.nohost/cgi-bin/admin/set-base-url?baseUrl=${baseUrl}`;
    await request(req);
    ctx.storage.setDomain(domain);
  }
  ctx.body = { ec: 0 };
};
