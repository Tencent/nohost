
const { getWhistleData } = require('../util');

module.exports = async (ctx) => {
  const { storage, req } = ctx;
  req.url = '/plugin.nohost/cgi-bin/admin/get-auth-key';
  let authKey;
  try {
    authKey = (await getWhistleData(req)).authKey;
  } catch (e) {}
  ctx.body = {
    ec: 0,
    admin: {
      username: storage.getAdmin().username,
    },
    domain: storage.getDomain(),
    authKey,
  };
};
