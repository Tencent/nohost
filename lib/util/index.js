const http = require('http');
const net = require('net');
const crypto = require('crypto');
const getAuth = require('basic-auth');
const { getRawHeaders, getRawHeaderNames, formatHeaders } = require('hparser');
const { isLocalAddress } = require('./address');
const { fork } = require('./whistleMgr');

const ENV_MAX_AGE = 60 * 60 * 24 * 3;
const STATUS_CODES = http.STATUS_CODES || {};
const noop = () => {};
const LOCALHOST = '127.0.0.1';
const XFF = 'x-forwarded-for';
const XWCP = 'x-whistle-client-port';

const getClientPort = (req) => {
  return req.socket.remotePort || 0;
};

const removeIPV6Prefix = (ip) => {
  if (typeof ip !== 'string') {
    return '';
  }
  return ip.indexOf('::ffff:') === 0 ? ip.substring(7) : ip;
};

const getClientIp = (req) => {
  let ip = req.headers[XFF];
  if (!net.isIP(ip)) {
    ip = req.socket.remoteAddress;
  }
  ip = removeIPV6Prefix(ip);
  return isLocalAddress(ip) ? LOCALHOST : ip;
};

exports.noop = noop;
exports.getClientIp = getClientIp;

/* eslint-disable no-empty */
const shasum = (str) => {
  if (typeof str !== 'string') {
    str = '';
  }
  const result = crypto.createHash('sha1');
  result.update(str);
  return result.digest('hex');
};
exports.shasum = shasum;

const getLoginKey = (ctx, username, password) => {
  const ip = ctx.ip || '127.0.0.1';
  return shasum(`${username || ''}\n${password || ''}\n${ip}`);
};

exports.checkLogin = (ctx, authConf) => {
  const {
    username,
    password,
    nameKey,
    authKey,
  } = authConf;

  if (!username || !password) {
    return true;
  }
  const curName = ctx.cookies.get(nameKey);
  const lkey = ctx.cookies.get(authKey);
  const correctKey = getLoginKey(ctx, username, password);
  if (curName === username && correctKey === lkey) {
    return true;
  }

  /* eslint-disable prefer-const */
  let { name, pass } = getAuth(ctx.req) || {};
  if (name === username && pass === password) {
    const options = {
      expires: new Date(Date.now() + (ENV_MAX_AGE * 1000)),
      path: '/',
    };
    ctx.cookies.set(nameKey, username, options);
    ctx.cookies.set(authKey, correctKey, options);
    return true;
  }

  ctx.status = 401;
  ctx.set('WWW-Authenticate', ' Basic realm=User Login');
  ctx.set('Content-Type', 'text/html; charset=utf8');
  ctx.body = 'Access denied, please <a href="javascript:;" onclick="location.reload()">try again</a>.';
  return false;
};

const restoreHeaders = (req) => {
  const { headers, rawHeaders } = req;
  return formatHeaders(headers, rawHeaders && getRawHeaderNames(rawHeaders));
};

const getStatusMessage = (code) => {
  return STATUS_CODES[code] || 'Unknown';
};

const getRawRes = (res) => {
  const code = res.statusCode || 502;
  const msg = res.statusMessage || getStatusMessage(code);
  return [
    `HTTP/1.1 ${code} ${msg}`,
    getRawHeaders(restoreHeaders(res)),
    '\r\n',
  ].join('\r\n');
};

const destroy = (req) => {
  if (req) {
    if (req.destroy) {
      req.destroy();
    } else if (req.abort) {
      req.abort();
    }
  }
};

exports.destroy = destroy;

const getOptions = (req, port) => {
  req.headers[XFF] = getClientIp(req);
  req.headers[XWCP] = getClientPort(req);
  return {
    port,
    path: req.url || '/',
    method: req.method,
    host: LOCALHOST,
    agent: false,
    headers: restoreHeaders(req),
  };
};

exports.getOptions = getOptions;

const proxyConnect = (req, port, callback) => {
  let client;
  let done;
  const execCallback = (err, svrRes, svrSock) => {
    if (err && client) {
      destroy(client);
      client = null;
    }
    if (!done) {
      done = true;
      callback(err, svrRes, svrSock);
    }
  };
  req.once('error', execCallback);
  try {
    client = http.request(getOptions(req, port));
  } catch (err) {
    return execCallback(err);
  }
  client.on('connect', (svrRes, svrSock) => execCallback(null, svrRes, svrSock));
  client.on('error', execCallback);
  client.end();
};

exports.proxyConnect = proxyConnect;

const proxyRequest = (req, port, callback) => {
  let client;
  let done;
  const execCallback = (err, svrRes) => {
    if (err && client) {
      destroy(client);
      client = null;
    }
    if (!done) {
      done = true;
      callback(err, svrRes);
    }
  };
  req.once('error', execCallback);
  try {
    client = http.request(getOptions(req, port));
  } catch (err) {
    return execCallback(err);
  }
  client.on('response', (svrRes) => execCallback(null, svrRes));
  client.on('error', execCallback);
  req.pipe(client);
};

exports.proxyRequest = proxyRequest;

exports.passThrough = async (req, res) => {
  const ctx = !res && req;
  if (ctx) {
    res = ctx.res;
    req = ctx.req;
  }
  let port;
  try {
    port = await fork();
  } catch (err) {
    if (ctx) {
      throw err;
    }
    return destroy(req);
  }
  if (ctx) {
    return new Promise((resolve, reject) => {
      proxyRequest(req, port, (err, svrRes) => {
        if (err) {
          return reject(err);
        }
        ctx.status = svrRes.statusCode;
        ctx.set(svrRes.headers);
        ctx.body = svrRes;
        resolve();
      });
    });
  }
  if (res.writeHead) {
    proxyRequest(req, port, (err, svrRes) => {
      if (err) {
        return destroy(req);
      }
      res.writeHead(svrRes.statusCode, restoreHeaders(svrRes));
      svrRes.pipe(res);
    });
  } else {
    proxyConnect(req, port, (err, svrRes, svrSock) => {
      if (err) {
        return destroy(req);
      }
      res.write(getRawRes(svrRes));
      res.pipe(svrSock).pipe(res);
    });
  }
};
