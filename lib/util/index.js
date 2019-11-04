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
  return req.socket.remotePort;
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

const passConnect = (req, socket) => {
  let client;
  let hadError;
  const handleError = () => {
    if (!hadError) {
      hadError = true;
      destroy(client);
      destroy(req);
    }
  };
  req.once('error', handleError);
  try {
    client = http.request(req.options);
  } catch (e) {
    return handleError();
  }
  client.on('connect', (svrRes, svrSock) => {
    socket.write(getRawRes(svrRes));
    socket.pipe(svrSock).pipe(socket);
  });
  client.on('error', handleError);
  client.end();
};

const passRequest = (req, res) => {
  let client;
  let hadError;
  const handleError = () => {
    if (!hadError) {
      hadError = true;
      destroy(client);
      destroy(req);
    }
  };
  req.once('error', handleError);
  try {
    client = http.request(req.options);
  } catch (e) {
    return handleError();
  }
  client.on('response', (svrRes) => {
    if (!hadError) {
      try {
        res.writeHead(svrRes.statusCode, restoreHeaders(svrRes));
        svrRes.pipe(res);
      } catch (e) {
        handleError();
      }
    }
  });
  client.on('error', handleError);
  req.pipe(client);
};

exports.passThrough = async (req, res) => {
  const { options } = req;
  options.method = req.method;
  options.host = LOCALHOST;
  options.agent = false;
  req.headers[XFF] = getClientIp(req);
  req.headers[XWCP] = getClientPort(req);
  options.headers = restoreHeaders(req);
  try {
    options.port = await fork();
  } catch (err) {
    return destroy(req);
  }
  return res.writeHead ? passRequest(req, res) : passConnect(req, res);
};
