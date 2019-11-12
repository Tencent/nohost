const { get } = require('../../util');

module.exports = async (ctx) => {
  ctx.storage.setDomain(ctx.request.body.domain);
  const { req } = ctx;
  req.url = `/plugin.nohost/cgi-bin/admin/set-base-url?baseUrl=${ctx.storage.getBaseUrl()}`;
  try {
    await get(req);
  } catch (e) {
    await get(req);
  }
  ctx.body = { ec: 0 };
};
