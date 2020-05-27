
const Koa = require('koa');
const onerror = require('koa-onerror');
const serve = require('koa-static');
const { join } = require('path');
const { Z_SYNC_FLUSH } = require('zlib');
const router = require('koa-router')();
const compress = require('koa-compress');
const setupRouter = require('./router');
const whistleMgr = require('./whistleMgr');
const certsMgr = require('./certsMgr');
const storage = require('./storage');

const MAX_AGE = 1000 * 60 * 5;
const HEADLESS_RE = /^\/account\/[^/]+\/share\//;
const aliasPages = {
  '/': '/select.html',
  '/index.html': '/select.html',
  '/data.html': '/capture.html',
  '/share.html': '/network.html',
};

const startApp = () => {
  const app = new Koa();
  app.proxy = true;
  onerror(app);
  app.use(async (ctx, next) => {
    let { path, req } = ctx;
    const newPath = aliasPages[path];
    if (newPath) {
      req.url = newPath;
    } else if (HEADLESS_RE.test(path)) {
      req.url = req.url.replace(RegExp['$&'], '/');
      path = ctx.path;
      if (path === '/' || path === '/share.html') {
        req.url = '/network.html';
      }
    }
    ctx.whistleMgr = whistleMgr;
    ctx.certsMgr = certsMgr;
    ctx.storage = storage;
    await next();
  });
  setupRouter(router);
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(compress({
    threshold: 2048,
    gzip: {
      flush: Z_SYNC_FLUSH,
    },
    deflate: {
      flush: Z_SYNC_FLUSH,
    },
    br: false, // disable brotli
  }));
  app.use(serve(join(__dirname, '../../public'), { maxage: MAX_AGE }));
  return app.callback();
};

module.exports = startApp();
