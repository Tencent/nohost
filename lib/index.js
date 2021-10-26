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
const HTTP_RE = /^\w+\s+\S+\s+HTTP\/1.\d$/mi;
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

const sendEstablished = (socket, err) => {
  const msg = err ? 'Bad Gateway' : 'Connection Established';
  const body = String((err && err.stack) || '');
  socket.write([
    `HTTP/1.1 ${err ? 502 : 200} ${msg}`,
    `Content-Length: ${Buffer.byteLength(body)}`,
    'Proxy-Agent: nohost/server',
    '\r\n',
  ].join('\r\n'));
};


const CLIENT_ID_HEAD = 'x-whistle-client-id';
const CLIENT_PORT_HEAD = 'x-whistle-client-port';
const CLIENT_IP_HEAD = 'x-forwarded-for';
const PROXY_AUTH_HEAD = 'proxy-authorization';

const addClientInfo = (socket, chunk, statusLine) => {
  chunk = chunk.slice(Buffer.byteLength(statusLine));
  const { remoteAddress, remotePort, headers } = socket;
  const auth = headers[PROXY_AUTH_HEAD];
  const clientIp = headers[CLIENT_IP_HEAD] || remoteAddress;
  const clientPort = headers[CLIENT_PORT_HEAD] || remotePort;
  const clientId = headers[CLIENT_ID_HEAD];
  statusLine += `\r\nx-forwarded-for: ${clientIp}`;
  statusLine += `\r\nx-whistle-client-port: ${clientPort}`;
  if (clientId) {
    statusLine += `\r\n${CLIENT_ID_HEAD}: ${clientId}`;
  }
  if (auth) {
    statusLine += `\r\n${PROXY_AUTH_HEAD}: ${auth}`;
  }
  socket.emit('data', Buffer.concat([Buffer.from(statusLine), chunk]));
};


module.exports = (options, cb) => {
  const { username, password, cluster } = options;
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
    if (!cluster && WORKER_RE.test(headers[NOHOST_ENV])) {
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
      // 强制替换域名
      headers['x-whistle-real-host'] = 'local.whistlejs.com';
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
  server.on('connect', async (req, socket) => {
    onClose(socket);
    ++options.tunnelReqs;
    ++options.totalReqs;
    if (isUIRequest(req, true)) {
      sendEstablished(socket);
      socket.headers = req.headers;
      socket.once('data', (chunk) => {
        if (HTTP_RE.test(`${chunk}`)) {
          const statusLine = RegExp['$&'];
          server.emit('connection', socket);
          addClientInfo(socket, chunk, statusLine);
        } else {
          socket.destroy();
        }
      });
    } else {
      handleRequest(req, socket);
    }
  });
  server.listen(options.port, host, cb);
  return server;
};
