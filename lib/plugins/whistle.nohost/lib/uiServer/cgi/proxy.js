const LRU = require('lru-cache');
const { transformWhistle } = require('../../util');
const whistleMgr = require('../../whistleMgr');

const tempCache = new LRU({ maxAge: 5000 });

module.exports = async (ctx, next) => {
  let { params: { name }, account } = ctx;
  if (!account) {
    account = ctx.accountMgr.getAccount(name);
    if (!account) {
      await next();
      return;
    }
  } else {
    name = account.name;
  }
  const { req } = ctx;
  req.url = req.url.substring(`/account/${name}`.length);
  if (!req.url.indexOf('/cgi-bin/get-data?') && req.url.indexOf('ip=self') !== -1) {
    const followerIp = ctx.envMgr.getFollower(ctx);
    req.url = req.url.replace('ip=self', `ip=self,clientId${followerIp ? `,${followerIp}` : ''}`);
  }
  req.headers.host = 'local.wproxy.org';
  req.headers['x-forwarded-for'] = ctx.ip || '127.0.0.1';
  const port = await whistleMgr.fork(account);
  try {
    await transformWhistle(ctx, port);
  } catch (err) {
    if (err.code === 'ECONNREFUSED' && !tempCache.get(name)) {
      tempCache.set(name, 1);
      whistleMgr.kill(name);
    }
    throw err;
  }
};
