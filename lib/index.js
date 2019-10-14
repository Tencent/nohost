const { createServer } = require('http');
const handlerRequest = require('./handleRequest');
const handleConnect = require('./handleConnect');

const DEFAULT_PORT = 8080;

module.exports = (options, cb) => {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  } else if (!options) {
    options = {};
  }
  options.port = parseInt(options.port, 10) || DEFAULT_PORT;
  const server = createServer(handlerRequest);
  server.on('connect', handleConnect);
  server.listen(options.port, cb);
  return server;
};
