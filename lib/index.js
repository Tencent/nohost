const { createServer } = require('http');
const handleRequest = require('./main');
const { passThrough, onClose, destroy } = require('./main/util');
const { isUIRequest, resetAdmin } = require('./main/storage');

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
  server.on('upgrade', passDirect);
  server.on('connect', passDirect);
  server.listen(options.port, cb);
  return server;
};
