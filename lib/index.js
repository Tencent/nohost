const { createServer } = require('http');
const { Socket } = require('net');
const { getFullUrl, parseUrl } = require('whistle/lib/util');
const { passThrough, noop, destroy, isLocalHost } = require('./util');
const handleRequest = require('./uiServer');

const DEFAULT_PORT = 8080;
const HOST_RE = /^[^:/]+\.[^:/]+:\d+$/;

// 避免第三方模块没处理好异常导致程序crash
const destroySocket = Socket.prototype.destroy;
Socket.prototype.destroy = function(err) {
  if (err && this.listenerCount('error')) {
    this.on('error', noop);
  }
  destroySocket.call(this, err);
};

const preventThrowOut = (req, res) => {
  req.on('error', noop);
  res.on('error', noop);
};


module.exports = (options, cb) => {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  } else if (!options) {
    options = {};
  }
  options.port = parseInt(options.port, 10) || DEFAULT_PORT;
  const server = createServer((req, res) => {
    preventThrowOut(req, res);
    req.options = parseUrl(getFullUrl(req));
    if (isLocalHost(req)) {
      handleRequest(req, res);
    } else {
      passThrough(req, res);
    }
  });
  server.on('connect', (req, socket) => {
    preventThrowOut(req, socket);
    const { headers } = req;
    const host = headers.host || req.url;
    if (!HOST_RE.test(host)) {
      return destroy(req);
    }
    headers.host = host;
    req.options = { path: host, headers };
    passThrough(req, socket);
  });
  server.listen(options.port, cb);
  return server;
};
