const assert = require('assert');
const { createServer } = require('http');
const { onClose } = require('@nohost/connect');
const handleUIRequest = require('./main');
const { passToWhistle } = require('./main/util');
const { isUIRequest, setAdmin, checkDomain } = require('./main/storage');

const NOHOST_ENV = 'x-whistle-nohost-env';
const NOHOST_RULE = 'x-whistle-nohost-rule';
const NOHOST_VALUE = 'x-whistle-nohost-value';
const WHISTLE_RULE = 'x-whistle-rule-value';
const WHISTLE_VALUE = 'x-whistle-key-value';
const WORKER_RE = /^\$(\d+)?$/;
const DEFAULT_PORT = 8080;
const LOCALHOST = '127.0.0.1';
const HOST_RE = /^(?:([\w.-]+):)?([1-9]\d{0,4})$/;
const HOST_LIST_RE = /^(?:([\w.-]+):)?([1-9]\d{0,4}(?:[-~][1-9]\d{0,4})?(?:,[1-9]\d{0,4}(?:[-~][1-9]\d{0,4})?)*)$/;
const resolveHost = (host) => {
  return HOST_RE.test(host) ? {
    host: RegExp.$1,
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
      if (/^([1-9]\d{0,4})[-~]([1-9]\d{0,4})$/.test(port)) {
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

  const handleRequest = (req, res) => {
    const { headers } = req;
    if (WORKER_RE.test(headers[NOHOST_ENV])) {
      if (headers[NOHOST_RULE]) {
        headers[WHISTLE_RULE] = headers[NOHOST_RULE];
      }
      if (headers[NOHOST_VALUE]) {
        headers[WHISTLE_VALUE] = headers[NOHOST_VALUE];
      }
      passToWhistle(req, res, RegExp.$1);
    } else {
      passToWhistle(req, res);
    }
  };

  const server = createServer((req, res) => {
    onClose(res);
    ++options.totalReqs;
    if (isUIRequest(req)) {
      ++options.uiReqs;
      const { headers } = req;
      delete headers.referer;
      headers.host = 'local.whistlejs.com';
      handleUIRequest(req, res);
    } else {
      handleRequest(req, res);
    }
  });
  server.timeout = 360000;
  server.on('upgrade', (req, socket) => {
    req.isUpgrade = true;
    onClose(socket);
    ++options.upgradeReqs;
    ++options.totalReqs;
    handleRequest(req, socket);
  });
  server.on('connect', (req, socket) => {
    onClose(socket);
    ++options.tunnelReqs;
    ++options.totalReqs;
    handleRequest(req, socket);
  });
  server.listen(options.port, host, cb);
  return server;
};
