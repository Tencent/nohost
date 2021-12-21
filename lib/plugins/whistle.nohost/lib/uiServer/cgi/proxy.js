const LRU = require('lru-cache');
const { transformWhistle, changeFilter } = require('../../util');
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
  changeFilter(req, ctx.envMgr.getFollower(ctx));
  req.headers.host = 'local.wproxy.org';
  req.headers['x-forwarded-for'] = ctx.ip || '127.0.0.1';
  const {
    port,
    remoteAddrHead,
    remotePortHead,
  } = await whistleMgr.fork(account);
  const remoteAddr = ctx.get('x-whistle-remote-address');
  if (remoteAddr) {
    req.headers[remoteAddrHead] = remoteAddr;
    req.headers[remotePortHead] = ctx.get('x-whistle-remote-port');
  }
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
