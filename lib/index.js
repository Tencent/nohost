const { createServer } = require('http');
const handleRequest = require('./main');
const { passThrough, onClose, destroy } = require('./main/util');
const { isUIRequest, resetAdmin, checkDomain } = require('./main/storage');

const DEFAULT_PORT = 8080;
const HOST_RE = /^(?:([\w.-]+):)?(\d{1,5})$/;
const resolveHost = (host) => {
  return HOST_RE.test(host) ? [RegExp.$1, parseInt(RegExp.$2, 10)] : [];
};

const preventThrowOut = (req, res) => {
  onClose(req, res, () => {
    destroy(req);
    destroy(res);
  });
};

module.exports = (options, cb) => {
  const { reset } = options;
  if (reset && reset !== 'none') {
    resetAdmin();
  }
  const [host, port] = resolveHost(options.port);
  options.host = host;
  options.port = port || DEFAULT_PORT;
  options.portStr = `${options.port}`;
  const { nohostDomain } = options;
  delete options.nohostDomain;
  options.domain = checkDomain(nohostDomain) ? nohostDomain.toLowerCase() : '';

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
  const passDirect = (req, socket) => {
    preventThrowOut(req, socket);
    passThrough(req, socket);
  };
  server.on('upgrade', (req, socket) => {
    req.isUpgrade = true;
    passDirect(req, socket);
  });
  server.on('connect', passDirect);
  server.listen(options.port, host, cb);
  return server;
};
