const assert = require('assert');
const { createServer } = require('http');
const { onClose } = require('@nohost/connect');
const handleRequest = require('./main');
const { passToWhistle } = require('./main/util');
const { isUIRequest, setAdmin, checkDomain } = require('./main/storage');

const DEFAULT_PORT = 8080;
const LOCALHOST = '127.0.0.1';
const HOST_RE = /^(?:([\w.-]+):)?(\d{1,5})$/;
const HOST_LIST_RE = /^(?:([\w.-]+):)?(\d{1,5}(?:[-~]\d{1,5})?(?:,\d{1,5}(?:[-~]\d{1,5})?)*)$/;
const resolveHost = (host) => {
  return HOST_RE.test(host) ? {
    host: RegExp.$1 || LOCALHOST,
    port: parseInt(RegExp.$2, 10),
  } : {};
};

const resolveHostList = (str) => {
  if (!str || typeof str !== 'string') {
    return;
  }
  str = str.split(/\||;/);
  let list;
  str.forEach((host) => {
    if (!HOST_LIST_RE.test(host)) {
      return;
    }
    host = RegExp.$1 || LOCALHOST;
    RegExp.$2.split(',').forEach((port) => {
      if (/^(\d{1,5})[-~](\d{1,5})$/.test(port)) {
        const p1 = parseInt(RegExp.$1, 10);
        const p2 = parseInt(RegExp.$2, 10);
        const max = Math.min(128, p2 - p1 + 1);
        for (let i = 0; i < max; ++i) {
          list = list || [];
          list.push({ host, port: p1 + i });
        }
      } else {
        list = list || [];
        list.push({ host, port: parseInt(port, 10) });
      }
    });
  });
  return list;
};


module.exports = (options, cb) => {
  const { username, password } = options;
  if (username || password) {
    if (username !== '+') {
      assert(username && typeof username === 'string', 'username is required.');
      assert(/^[\w.-]{1,32}$/.test(username), 'username is incorrect (/^[\\w.-]{1,32}$/).');
      assert(password && typeof password === 'string', 'password is required.');
      setAdmin({ username, password });
    }
  }
  const { host, port } = resolveHost(options.port);
  options.host = host;
  options.port = port || DEFAULT_PORT;
  options.storage = resolveHostList(options.storage);
  options.portStr = `${options.port}`;
  const { nohostDomain } = options;
  delete options.nohostDomain;
  options.domain = checkDomain(nohostDomain) ? nohostDomain.toLowerCase() : '';

  const server = createServer((req, res) => {
    onClose(res, err => req.emit('close', err));
    if (isUIRequest(req)) {
      const { headers } = req;
      delete headers.referer;
      headers.host = 'local.whistlejs.com';
      handleRequest(req, res);
    } else {
      passToWhistle(req, res);
    }
  });
  const passDirect = (req, socket) => {
    onClose(socket);
    passToWhistle(req, socket);
  };
  server.timeout = 360000;
  server.on('upgrade', (req, socket) => {
    req.isUpgrade = true;
    passDirect(req, socket);
  });
  server.on('connect', passDirect);
  server.listen(options.port, host, cb);
  return server;
};
