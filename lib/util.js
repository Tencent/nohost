const http = require('http');
const {
  getFullUrl,
  parseUrl,
  getClientIp,
  getClientPort,
  getStatusCode,
  sendStatusCodeError,
  connect,
} = require('whistle/lib/util');
const {
  getRawHeaders,
  getRawHeaderNames,
  formatHeaders,
} = require('hparser');
const { fork } = require('./whistleMgr');

const noop = () => {};
const LOCALHOST = '127.0.0.1';
const XFF = 'x-forwarded-for';
const XWCP = 'x-whistle-client-port';
const TUNNEL_HOST_RE = /^[^:/]+\.[^:/]+:\d+$/;

exports.noop = noop;
exports.getFullUrl = getFullUrl;
exports.parseUrl = parseUrl;
exports.getClientIp = getClientIp;

const restoreHeaders = (req) => {
  const { headers, rawHeaders } = req;
  return formatHeaders(headers, rawHeaders && getRawHeaderNames(rawHeaders));
};

const passRequest = (options, req, res) => {
  const client = http.request(options, (svrRes) => {
    if (getStatusCode(svrRes.statusCode)) {
      res.writeHead(svrRes.statusCode, restoreHeaders(svrRes));
      svrRes.pipe(res);
      if (svrRes.trailers) {
        res.addTrailers(svrRes.trailers);
      }
    } else {
      sendStatusCodeError(res, svrRes);
    }
  });
  client.on('error', (err) => {
    res.emit('error', err);
  });
  req.pipe(client);
  return client;
};

const getTunnelHost = (req) => {
  return TUNNEL_HOST_RE.test(req.url) ? req.url : req.headers.host;
};

const passConnect = (options, req, socket) => {
  connect(options, (err, client) => {
    if (err) {
      return socket.destroy(err);
    }
    const headers = getRawHeaders(options.headers);
    client.write(`CONNECT ${getTunnelHost(req)} HTTP/1.1\r\n${headers}\r\n\r\n`);
    socket.pipe(client).pipe(socket);
  });
};

exports.passThrough = async (req, res) => {
  req.on('error', noop);
  res.on('error', noop);
  const options = req.options || parseUrl(getFullUrl(req));
  options.host = LOCALHOST;
  options.port = await fork();
  options.method = req.method;
  options.hostname = null;
  options.protocol = null;
  options.agent = false;
  req.headers[XFF] = getClientIp(req);
  req.headers[XWCP] = getClientPort(req);
  options.headers = restoreHeaders(req);
  return res.writeHead ? passRequest(options, req, res) : passConnect(options, req, res);
};

exports.isLocalHost = (req) => {
  return true;
};
