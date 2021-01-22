const { request, tunnel, upgrade, getRawHeaders } = require('@nohost/connect');
const cpuNum = require('os').cpus().length;
const { fork } = require('./whistleMgr');
const startService = require('../service');

const LOCALHOST = '127.0.0.1';
const PROXY_OPTIONS = { host: LOCALHOST, port: 8080 };
const ERROR_HEADERS = { 'x-server': 'nohost/connect' };

const sendError = (res, err) => {
  res.writeH(500, ERROR_HEADERS);
  res.end(err.stack);
};
const proxyCtx = async (ctx, options) => {
  const svrRes = await request(ctx.req, options);
  ctx.status = svrRes.statusCode;
  ctx.set(svrRes.headers);
  ctx.body = svrRes;
};

exports.passToWhistle = async (req, res) => {
  const ctx = !res && req;
  if (ctx) {
    res = ctx.res;
    req = ctx.req;
  }
  try {
    PROXY_OPTIONS.port = await fork();
  } catch (err) {
    if (ctx) {
      throw err;
    }
    return sendError(res, err);
  }
  if (req._hasError) {
    return;
  }
  if (ctx) {
    return proxyCtx(ctx, PROXY_OPTIONS);
  }
  if (res.writeHead) {
    try {
      const svrRes = await request(req, PROXY_OPTIONS);
      res.writeHead(svrRes.statusCode, getRawHeaders(svrRes));
      svrRes.pipe(res);
    } catch (err) {
      sendError(res, err);
    }
  } else if (req.isUpgrade) {
    upgrade(req, PROXY_OPTIONS);
  } else {
    tunnel(req, PROXY_OPTIONS);
  }
};

const MAX_REQUESTS = 120;
const conns = [0];

const getServerIndex = () => {
  const len = conns.length;
  let min = conns[0];
  if (min < MAX_REQUESTS) {
    ++conns[0];
    return 0;
  }
  let index = 0;
  for (let i = 1; i < len; i++) {
    if (min > conns[i]) {
      min = conns[i];
      index = i;
    }
  }
  if (min < MAX_REQUESTS || len >= cpuNum) {
    ++conns[index];
    return index;
  }
  conns[len] = 1;
  return len;
};

exports.passToService = async (ctx) => {
  const index = getServerIndex();
  const port = await startService(index);
  await proxyCtx(ctx, { host: LOCALHOST, port });
  --conns[index];
};
