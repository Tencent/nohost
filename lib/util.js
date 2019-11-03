const http = require('http');
const {
  getFullUrl,
  parseUrl,
  getClientIp,
  getClientPort,
  getStatusCode,
} = require('whistle/lib/util');
const {
  getRawHeaders,
  getRawHeaderNames,
  formatHeaders,
} = require('hparser');
const { fork } = require('./whistleMgr');

const STATUS_CODES = http.STATUS_CODES || {};
const noop = () => {};
const LOCALHOST = '127.0.0.1';
const XFF = 'x-forwarded-for';
const XWCP = 'x-whistle-client-port';

exports.noop = noop;
exports.getFullUrl = getFullUrl;
exports.parseUrl = parseUrl;
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

const passConnect = (req, socket) => {
  const client = http.request(req.options);
  client.on('connect', (svrRes, svrSock) => {
    socket.write(getRawRes(svrRes));
    socket.pipe(svrSock).pipe(socket);
  });
  client.on('error', (err) => {
    socket.emit('error', err);
  });
  client.end();
};

const passRequest = (req, res) => {
  const client = http.request(req.options, (svrRes) => {
    if (getStatusCode(svrRes.statusCode)) {
      res.writeHead(svrRes.statusCode, restoreHeaders(svrRes));
      svrRes.pipe(res);
    } else {
      res.emit('error', new Error('Bad statusCode'));
    }
  });
  client.on('error', (err) => {
    req.emit('error', err);
  });
  req.pipe(client);
};

function destroy(req) {
  if (req.destroy) {
    req.destroy();
  } else if (req.abort) {
    req.abort();
  }
}

exports.destroy = destroy;

exports.passThrough = async (req, res) => {
  const { options } = req;
  options.method = req.method;
  options.host = LOCALHOST;
  options.hostname = null;
  options.protocol = null;
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

exports.isLocalHost = (req) => {
  return false;
};
