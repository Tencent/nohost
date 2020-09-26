
const { createServer } = require('http');
const Koa = require('koa');
const onerror = require('koa-onerror');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
const setupRouter = require('./router');


module.exports = ({ value: port }, callback) => {
  const server = createServer();
  const app = new Koa();
  app.proxy = true;
  app.silent = true;
  if (process.env.PFORK_MODE === 'bind') {
    onerror(app);
  }
  setupRouter(router);
  app.use(bodyParser({ formLimit: '8mb' }));
  app.use(router.routes());
  app.use(router.allowedMethods());
  server.on('request', app.callback());
  server.on('error', callback);
  server.listen(port, '127.0.0.1', callback);
};
