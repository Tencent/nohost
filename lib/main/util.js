const { request, tunnel, upgrade, getRawHeaders } = require('@nohost/connect');
const cpuNum = require('os').cpus().length;
const { fork } = require('./whistleMgr');
const startService = require('../service');
const { fork: forkWorker } = require('./worker');
const config = require('../config');

const LOCALHOST = '127.0.0.1';
const FROM_RE = /[?&]from=[\w.-]+(?:&|$)/;
const ERROR_HEADERS = { 'x-server': 'nohost/connect' };

const sendError = (res, err) => {
  if (res.writeHead) {
    res.writeHead(500, ERROR_HEADERS);
    res.end(err.stack);
  } else {
    res.destroy();
  }
};
const proxyCtx = async (ctx, options) => {
  const svrRes = await request(ctx.req, ctx.res, options);
  ctx.status = svrRes.statusCode;
  ctx.set(svrRes.headers);
  ctx.body = svrRes;
};

const passToWhistle = async (req, res, index) => {
  const ctx = !res && req;
  if (ctx) {
    res = ctx.res;
    req = ctx.req;
  }
  const options = { host: LOCALHOST };
  try {
    options.port = index == null ? await fork() : await forkWorker(index);
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
    return proxyCtx(ctx, options);
  }
  if (res.writeHead) {
    try {
      const svrRes = await request(req, res, options);
      res.writeHead(svrRes.statusCode, getRawHeaders(svrRes));
      svrRes.pipe(res);
    } catch (err) {
      sendError(res, err);
    }
  } else if (req.isUpgrade) {
    upgrade(req, options);
  } else {
    tunnel(req, options);
  }
};

exports.passToWhistle = passToWhistle;

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

exports.getRedirectUrl = (ctx, url) => {
  let { redirectUrl } = config;
  if (!redirectUrl) {
    return;
  }
  const page = ctx.path;
  redirectUrl = `${redirectUrl}${page}`;
  const index = url.indexOf('?');
  url = index === -1 ? '' : url.substring(index + 1);
  if (!url) {
    return `${redirectUrl}?from=nohost`;
  }
  if (!FROM_RE.test(url)) {
    url = `${url}&from=nohost`;
  }
  return `${redirectUrl}?${url}`;
};

const PURE_URL_RE = /^((?:https?:)?\/\/[\w.-]+[^?#]*)/;
exports.parsePureUrl = (str) => {
  if (!str || !PURE_URL_RE.test(str)) {
    return;
  }
  return RegExp.$1.replace(/\/+$/, '');
};
