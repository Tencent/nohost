const LRU = require('lru-cache');
const { transformWhistle } = require('../../util');
const whistleMgr = require('../../whistleMgr');

const tempCache = new LRU({ maxAge: 5000 });

module.exports = async (ctx, next) => {
  const account = ctx.account || ctx.accountMgr.getAccount(ctx.params.name);
  if (!account) {
    await next();
    return;
  }
  const { name } = account;
  const { req } = ctx;
  req.url = req.url.substring(`/account/${name}`.length);
  if (!req.url.indexOf('/cgi-bin/get-data?') && req.url.indexOf('ip=self') !== -1) {
    const followerIp = ctx.envMgr.getFollower(ctx);
    if (followerIp) {
      req.url = req.url.replace('ip=self', `ip=self,${followerIp}`);
    }
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
