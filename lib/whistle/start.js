
const http = require('http');
const path = require('path');
const startWhistle = require('whistle');
const { getServerIp } = require('../util/address');
const parseDomain = require('../util/parseDomain');

let curPort = 30013;
const getShadowRules = (port, domain) => {
  domain = parseDomain(domain);
  domain.unshift(`//${getServerIp()}:${port}`);
  return domain.map((d) => {
    return `${d} http://127.0.0.1:${port} enable://capture`;
  }).join('\n');
};

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
      domain,
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
      shadowRules: getShadowRules(realPort, domain),
      pluginsDataMap: {
        nohost: {
          username,
          password,
          domain,
          realPort,
        },
      },
      mode: options.debugMode ? '' : 'strict|rules',
      addon: [
        path.join(__dirname, '../plugins'),
      ],
    }, () => callback(null, port));
  });
};
