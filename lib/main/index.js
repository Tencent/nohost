
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
const { getRedirectUrl } = require('./util');

const MAX_AGE = 1000 * 60 * 5;
const HEADLESS_RE = /^\/account\/[^/]+\/share\//;
const EXPORT_RE = /\/export_sessions$/;
const SPECIAL_PATH = '/nohost/';
const aliasPages = {
  '/': '/select.html',
  '/index.html': '/select.html',
  '/data.html': '/capture.html',
  '/share.html': '/network.html',
};

const startApp = () => {
  const app = new Koa();
  app.proxy = true;
  app.silent = true;
  onerror(app);
  app.use(async (ctx, next) => {
    let { path, req } = ctx;
    if (!path.indexOf(SPECIAL_PATH)) {
      req.url = req.url.replace(SPECIAL_PATH, '/');
      path = ctx.path;
    }
    const newPath = aliasPages[path];
    if (newPath) {
      ctx.pageName = path;
      req.url = newPath;
    } else if (HEADLESS_RE.test(path)) {
      req.url = req.url.replace(RegExp['$&'], '/');
      path = ctx.path;
      if (path === '/' || path === '/share.html') {
        req.url = '/network.html';
        ctx.pageName = '/share.html';
      }
    } else if (EXPORT_RE.test(path)) {
      path = '/cgi-bin/sessions/export';
      let query = req.url.indexOf('?');
      query = query === -1 ? '' : req.url.substring(query);
      req.url = path + query;
    } else {
      const index = path.indexOf('/nohost_share/');
      if (index !== -1) {
        const accountName = path.substring(0, index);
        ctx.accountName = accountName.substring(accountName.lastIndexOf('/') + 1);
        req.url = req.url.substring(req.url.indexOf('/nohost_share/') + 13);
        path = ctx.path;
        if (path === '/' || path === '/share.html') {
          req.url = '/network.html';
          ctx.pageName = '/share.html';
        }
      }
    }
    const redirectUrl = getRedirectUrl(ctx);
    if (redirectUrl) {
      return ctx.redirect(redirectUrl);
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
