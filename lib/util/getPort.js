const http = require('http');

let curPort = 30013;

const getPort = (callback) => {
  const server = http.createServer();
  server.on('error', () => {
    if (++curPort % 5 === 0) {
      ++curPort;
    }
    getPort(callback);
  });
  server.listen(curPort, '127.0.0.1', () => {
    server.removeAllListeners();
    server.close(() => callback(curPort));
  });
};

module.exports = getPort;
