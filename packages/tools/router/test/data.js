const http = require('http');
const Koa = require('koa');
const koaRouter = require('koa-router')();
const Router = require('../lib');

const {
  writeHead,
} = Router;
const servers = [
  {
    host: '127.0.0.1',
    port: 8080,
  },
];
const ENV_MAP = {
  1: {
    spaceName: 'imweb',
    groupName: 'avenwu',
    envName: '测试',
  },
  2: {
    spaceName: 'imweb',
    groupName: 'avenwu2',
    envName: '测试2',
    clientId: 'test',
    // callback: console.log,
  },
};

const router = new Router(servers);
const server = http.createServer();
const app = new Koa();

koaRouter.all('/network/:id/(.*)', async (ctx) => {
  const network = ENV_MAP[ctx.params.id];
  if (!network) {
    return;
  }
  const { req, res } = ctx;
  req.url = req.url.replace(`/network/${ctx.params.id}`, '');
  const svrRes = await router.proxyUI(req, res, network);
  writeHead(res, svrRes);
  // ctx.status = svrRes.statusCode;
  // ctx.set(svrRes.headers);
  ctx.body = svrRes;
});

app.use(koaRouter.routes());
app.use(koaRouter.allowedMethods());

server.on('request', app.callback());
server.listen(6677);
