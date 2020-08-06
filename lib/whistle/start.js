
const path = require('path');
const startWhistle = require('whistle');
const { getServerIp } = require('../util/address');
const parseDomain = require('../util/parseDomain');
const getPort = require('../util/getPort');

const getShadowRules = (port, domain) => {
  domain = parseDomain(domain);
  domain.unshift(`//${getServerIp()}:${port}`);
  return domain.map((d) => {
    return `${d} http://127.0.0.1:${port} enable://capture`;
  }).join('\n');
};

module.exports = (options, callback) => {
  getPort((port) => {
    const {
      domain,
      username,
      password,
      realPort,
      storageServer,
    } = options;
    startWhistle({
      port,
      encrypted: true,
      username,
      password,
      realPort,
      cmdName: 'n2 -g',
      host: '127.0.0.1',
      shadowRules: getShadowRules(realPort, domain),
      pluginsDataMap: {
        nohost: {
          username,
          password,
          domain,
          realPort,
          storageServer,
        },
      },
      mode: options.debugMode ? '' : 'strict|rules|disableUpdateTips|proxifier|notAllowedDisablePlugins',
      addon: [
        path.join(__dirname, '../plugins'),
      ],
    }, () => callback(null, port));
  });
};
