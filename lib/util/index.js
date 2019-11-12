const http = require('http');
const net = require('net');
const { getRawHeaders, getRawHeaderNames, formatHeaders } = require('hparser');
const { isLocalAddress } = require('./address');
const { fork } = require('./whistleMgr');

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

exports.removeIPV6Prefix = removeIPV6Prefix;

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

exports.get = async (req) => {
  const port = await fork();
  return new Promise((resolve, reject) => {
    const options = getOptions(req, port);
    options.method = 'GET';
    const client = http.request(options, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Error status code: ${res.statusCode}`));
      }
      res.on('error', reject);
      res.setEncoding('utf8');
      let body = '';
      res.on('data', (str) => {
        body += str;
      });
      res.on('end', () => {
        if (body) {
          try {
            return resolve(JSON.parse(body));
          } catch (e) {}
        }
        resolve('');
      });
    });
    client.on('error', reject);
    client.end();
  });
};

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
