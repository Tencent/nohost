const { get } = require('../../util');

module.exports = async (ctx) => {
  const { domain } = ctx.request.body;
  const { checkDomain, getBaseUrl } = ctx.storage;
  if (checkDomain(domain)) {
    const { req } = ctx;
    const baseUrl = getBaseUrl(domain);
    req.url = `/plugin.nohost/cgi-bin/admin/set-base-url?baseUrl=${baseUrl}`;
    try {
      await get(req);
    } catch (e) {
      await get(req);
    }
    ctx.storage.setDomain(domain);
  }
  ctx.body = { ec: 0 };
};
