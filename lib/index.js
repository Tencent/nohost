const { createServer } = require('http');
const parseUrl = require('url').parse;
const { passThrough, noop, destroy } = require('./util');
const handleRequest = require('./uiServer');
const { isUIRequest } = require('./uiServer/storage');

const DEFAULT_PORT = 8080;
const HOST_RE = /^[^:/]+\.[^:/]+:\d+$/;

const preventThrowOut = (req, res) => {
  req.on('error', noop);
  res.on('error', noop);
};

const getPath = (req) => {
  if (!req.url) {
    return '';
  }
  if (req.url[0] === '/') {
    return req.url;
  }
  return parseUrl(req.url).path;
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
    if (isUIRequest(req)) {
      req.headers.host = 'local.whistlejs.com';
      let path = getPath(req);
      if (path.indexOf('/nohost/cgi-bin/') === 0 || path.indexOf('/nohost/whistle/') === 0) {
        req.url = req.url.replace('/nohost/', '/');
        path = path.replace('/nohost/', '/');
      }
      const isCgi = path.indexOf('/cgi-bin/') === 0;
      const isAccountReq = !isCgi && path.indexOf('/account/') === 0;
      if (isCgi || isAccountReq || path.indexOf('/whistle/') === 0) {
        path = req.url;
        if (isCgi) {
          path = req.url.replace('/cgi-bin/', '/plugin.nohost/cgi-bin/');
        } else if (isAccountReq) {
          path = req.url.replace('/account/', '/plugin.nohost/account/');
        }
        req.options = {
          path,
          headers: req.headers,
        };
        return passThrough(req, res);
      }
      handleRequest(req, res);
    } else {
      req.options = {
        path: req.url || '/',
        headers: req.headers,
      };
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
