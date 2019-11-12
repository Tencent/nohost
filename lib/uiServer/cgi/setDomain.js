const { get } = require('../../util');

module.exports = async (ctx) => {
  const { req } = ctx;
  req.url = `/plugin.nohost/cgi-bin/admin/set-base-url?baseUrl=${ctx.storage.getBaseUrl()}`;
  try {
    await get(req);
  } catch (e) {
    await get(req);
  }
  ctx.storage.setDomain(ctx.request.body.domain);
  ctx.body = { ec: 0 };
};
