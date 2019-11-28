
const Koa = require('koa');
const onerror = require('koa-onerror');
const serve = require('koa-static');
const { join } = require('path');
const router = require('koa-router')();
const setupRouter = require('./router');
const whistleMgr = require('./whistleMgr');
const certsMgr = require('./certsMgr');
const storage = require('./storage');

const MAX_AGE = 1000 * 60 * 5;
const aliasPages = {
  '/': '/select.html',
  '/index.html': '/select.html',
  '/data.html': 'capture.html',
};

const startApp = () => {
  const app = new Koa();
  app.proxy = true;
  onerror(app);
  app.use(async (ctx, next) => {
    const { path, req } = ctx;
    const newPath = aliasPages[path];
    if (newPath) {
      req.url = newPath;
    }
    ctx.whistleMgr = whistleMgr;
    ctx.certsMgr = certsMgr;
    ctx.storage = storage;
    await next();
  });
  setupRouter(router);
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(serve(join(__dirname, '../../public'), { maxage: MAX_AGE }));
  return app.callback();
};

module.exports = startApp();
