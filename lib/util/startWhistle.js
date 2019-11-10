
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
    const {
      baseUrl,
      username,
      password,
      realPort,
    } = options;
    startWhistle({
      port,
      encrypted: true,
      username,
      password,
      realPort,
      shadowRules: `@http://127.0.0.1:${options.realPort}/shadow-rules`,
      pluginsDataMap: {
        nohost: {
          username,
          password,
          baseUrl,
          realPort,
        },
      },
      mode: 'strict|rules',
      addon: [
        path.join(__dirname, '../plugins'),
      ],
    }, () => callback(null, port));
  });
};
