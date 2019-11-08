
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
      encrypted: true,
      username: options.username,
      password: options.password,
      realPort: options.realPort,
      pluginsDataMap: {
        nohost: {
          username: options.username,
          password: options.password,
          guestName: options.guestName,
          guestPassword: options.guestPassword,
          baseUrl: options.baseUrl,
        },
      },
      mode: 'strict|rules',
      addon: [
        path.join(__dirname, '../plugins'),
      ],
    }, () => callback(null, port));
  });
};
