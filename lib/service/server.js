
const { createServer } = require('http');
const Koa = require('koa');
const onerror = require('koa-onerror');
const router = require('koa-router')();
const setupRouter = require('./router');


module.exports = ({ port }, callback) => {
  const server = createServer();
  const app = new Koa();
  app.proxy = true;
  if (process.env.PFORK_MODE === 'bind') {
    onerror(app);
  }
  setupRouter(router);
  app.use(router.routes());
  app.use(router.allowedMethods());
  server.on('request', app.callback());
  server.on('error', callback);
  server.listen(port, '127.0.0.1', callback);
};
