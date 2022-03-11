const { proxy, getRawHeaders } = require('@nohost/router');
const { isIP } = require('net');
const cpuNum = require('os').cpus().length;
const {
  getRemoteAddr,
  getRemotePort,
} = require('whistle/lib/util');
const { fork } = require('./whistleMgr');
const startService = require('../service');
const { fork: forkWorker } = require('./worker');
const config = require('../config');

const LOCALHOST = '127.0.0.1';
const FROM_RE = /[?&]from=[\w.-]+(?:&|$)/;
const ERROR_HEADERS = { 'x-server': 'nohost/router' };

const sendError = (res, err) => {
  if (res.writeHead) {
    res.writeHead(500, ERROR_HEADERS);
    res.end(err.stack);
  } else {
    res.destroy();
  }
};
const proxyCtx = async (ctx, options) => {
  const svrRes = await proxy(ctx.req, ctx.res, options);
  ctx.status = svrRes.statusCode;
  ctx.set(svrRes.headers);
  ctx.body = svrRes;
};

exports.passToWhistle = async (req, res, index) => {
  const ctx = !res && req;
  if (ctx) {
    res = ctx.res;
    req = ctx.req;
  }
  const options = { host: LOCALHOST };
  let remoteAddrHead;
  let remotePortHead;
  const isSingleton = index == null;
  try {
    const result = isSingleton ? await fork() : await forkWorker(index);
    options.port = result.port;
    remoteAddrHead = result.remoteAddrHead;
    remotePortHead = result.remotePortHead;
  } catch (err) {
    if (ctx) {
      throw err;
    }
    return sendError(res, err);
  }
  if (req._hasError) {
    return;
  }
  const { headers } = req;
  const remoteAddress = !isSingleton && headers['x-whistle-remote-address'];
  const remotePort = !isSingleton && headers['x-whistle-remote-port'];
  if (remotePort > 0 && remotePort < 65536 && isIP(remoteAddress)) {
    headers[remoteAddrHead] = remoteAddress;
    headers[remotePortHead] = remotePort;
    delete headers['x-whistle-remote-address'];
    delete headers['x-whistle-remote-port'];
  } else {
    headers[remoteAddrHead] = getRemoteAddr(req);
    headers[remotePortHead] = getRemotePort(req);
  }
  if (ctx) {
    return proxyCtx(ctx, options);
  }
  if (req.upgrade) {
    return proxy(req, res, options);
  }
  try {
    const svrRes = await proxy(req, res, options);
    res.writeHead(svrRes.statusCode, getRawHeaders(svrRes));
    svrRes.pipe(res);
  } catch (err) {
    sendError(res, err);
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

const REDIRECT_PAGES = {
  '/': '/select.html',
  '/share.html': '/share.html',
  '/select.html': '/select.html',
  '/index.html': '/select.html',
  '/capture.html': '/',
  '/data.html': '/',
};

exports.getRedirectUrl = (ctx) => {
  let { redirect } = config;
  const { pageName, originalUrl: url, accountName } = ctx;
  const page = REDIRECT_PAGES[pageName];
  if (!redirect || !page || FROM_RE.test(url)) {
    return;
  }
  redirect = `${redirect}${page}`;
  const index = url.indexOf('?');
  let query = index === -1 ? '' : url.substring(index + 1);
  if (accountName) {
    query = `${query ? `${query}&` : ''}account=${encodeURIComponent(accountName)}`;
  }
  return query ? `${redirect}?${query}` : redirect;
};
