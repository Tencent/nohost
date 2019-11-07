
const http = require('http');
const path = require('path');
const startWhistle = require('whistle');

let curPort = 30013;

const getPort = (callback) => {
  const server = http.createServer();
  server.on('error', () => {
    if (++curPort % 5 === 0) {
      ++curPort;
    }
    getPort(callback);
  });
  server.listen(curPort, () => {
    server.removeAllListeners();
    server.close(() => callback(curPort));
  });
};

module.exports = (options, callback) => {
  getPort((port) => {
    startWhistle({
      port,
      username: options.username,
      password: options.password,
      mode: 'strict|rules',
      addon: [
        path.join(__dirname, '../plugins'),
      ],
    }, () => callback(null, port));
  });
};
