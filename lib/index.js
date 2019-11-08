const { createServer } = require('http');
const { passThrough, noop, destroy } = require('./util');
const handleRequest = require('./uiServer');
const { isUIRequest, resetAdmin } = require('./uiServer/storage');
const { setConfig } = require('./util/whistleMgr');

const DEFAULT_PORT = 8080;
const HOST_RE = /^[^:/]+\.[^:/]+:\d+$/;

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
  if (options.reset) {
    resetAdmin();
  }
  setConfig(options);
  const server = createServer((req, res) => {
    preventThrowOut(req, res);
    if (isUIRequest(req)) {
      const { headers } = req;
      delete headers.referer;
      headers.host = 'local.whistlejs.com';
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
    req.url = host;
    headers.host = host;
    passThrough(req, socket);
  });
  server.listen(options.port, cb);
  return server;
};
