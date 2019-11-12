const { get } = require('../../util');

const request = async (req) => {
  try {
    await get(req);
  } catch (err) {
    try {
      await get(req);
    } catch (e) {}
  }
};

module.exports = async (ctx) => {
  const admin = ctx.storage.setAdmin(ctx.request.body);
  if (admin) {
    const { username, password } = admin;
    const { req } = ctx;
    const query = `?username=${username}&password=${password}`;
    req.url = `/plugin.nohost/cgi-bin/admin/set-admin${query}`;
    await request(req);
    req.url = `/cgi-bin/custom-handler${query}`;
    await request(req);
  }
  ctx.body = { ec: admin ? 0 : 2 };
};
