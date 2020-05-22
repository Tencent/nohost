const Limiter = require('async-limiter');
const { gzip } = require('zlib');
const LRU = require('lru-cache');

const limiter = new Limiter({ concurrency: 10 });
const cache = new LRU({ max: 10 });

const compress = (body) => {
  let promise = cache[body];
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      limiter.push((done) => {
        gzip(body, (err, buf) => {
          done();
          if (err) {
            delete cache[body];
            reject(err);
          } else {
            resolve(buf);
          }
        });
      });
    });
    cache[body] = promise;
  }
  return promise;
};

module.exports = async (ctx) => {
  const curEnv = ctx.envMgr.getEnv(ctx);
  const list = ctx.accountMgr.getAccountList(ctx.request.query.parsed);
  let body = JSON.stringify({
    admin: ctx.admin,
    ec: 0,
    baseUrl: ctx.baseUrl,
    curEnv,
    list,
  });
  body = await compress(body);
  ctx.set('content-encoding', 'gzip');
  ctx.set('content-type', 'application/json');
  ctx.body = body;
};
