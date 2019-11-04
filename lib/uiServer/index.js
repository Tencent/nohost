
const Koa = require('koa');
const onerror = require('koa-onerror');
const serve = require('koa-static');
const path = require('path');
const router = require('koa-router')();
const setupRouter = require('./router');

const MAX_AGE = 1000 * 60 * 5;

const startApp = () => {
  const app = new Koa();
  app.proxy = true;
  onerror(app);
  setupRouter(router);
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(serve(path.join(__dirname, '../../public'), { maxage: MAX_AGE }));
  return app.callback();
};

module.exports = startApp();
