
const path = require('path');
const startWhistle = require('whistle');
const { homedir } = require('os');
const { getServerIp } = require('./util/address');
const parseDomain = require('./util/parseDomain');
const getPort = require('./util/getPort');

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
      authKey,
    } = options;
    const projectPluginPath = [path.join(__dirname, 'plugins')];
    let { baseDir } = options;
    if (/^~\//.test(baseDir)) {
      baseDir = path.join(homedir(), baseDir.substring(2));
    } else if (baseDir && /^[\w.-]+$/) {
      baseDir = path.join(homedir(), '.nohost', baseDir);
    }
    if (baseDir) {
      process.env.NOHOST_BADE_DIR = baseDir;
    }
    startWhistle({
      port,
      baseDir,
      projectPluginPath,
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
          authKey,
        },
      },
      mode: options.debugMode ? 'proxyServer' : 'proxyServer|strict|rules|disableUpdateTips|proxifier|notAllowedDisablePlugins',
      addon: projectPluginPath,
    }, () => callback(null, port));
  });
};
