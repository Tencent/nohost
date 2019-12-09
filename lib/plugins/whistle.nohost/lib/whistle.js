const startWhistle = require('whistle');
const path = require('path');
const HOME_DIR = require('os').homedir();
const { CONFIG_DATA_TYPE, getPort } = require('./util');

const WHISTLE_SECURE_FILTER = path.resolve(HOME_DIR, 'nohost/whistleSecureFilter.js');
const PLUGINS_DIR = path.resolve(HOME_DIR, 'whistle-plugins');
const NOHOST_PLUGINS = path.join(PLUGINS_DIR, 'whistle.nohost/node_modules');
const IDLE_TIMEOUT = 12 * 60 * 1000;
const SHADOW_RULES = '* responseFor://name=x-upstream,req.x-whistle-nohost-env';

let index = 0;
let updatedIndex;
let curEnvList = [];

const syncData = (proxy) => {
  let updateTimer;
  let checkTimer;
  process.on('data', (data) => {
    const type = data && data.type;
    if (type !== CONFIG_DATA_TYPE) {
      return;
    }
    if (data.index >= 0) {
      updatedIndex = data.index;
      if (updatedIndex === index) {
        clearTimeout(checkTimer);
        checkTimer = null;
      }
    }
    proxy.setAuth(data);
  });
  const updateRules = () => {
    process.sendData({
      index,
      envList: proxy.rulesUtil.rules.list(),
      type: CONFIG_DATA_TYPE,
    });
    updateTimer = null;
    clearTimeout(checkTimer);
    checkTimer = setTimeout(() => {
      checkTimer = null;
      if (updatedIndex !== index) {
        updateRules();
      }
    }, 1000);
  };
  proxy.on('rulesDataChange', () => {
    ++index;
    updateTimer = updateTimer || setTimeout(updateRules, 300);
  });
};

module.exports = (options, callback) => {
  getPort((port) => {
    const proxy = startWhistle({
      port,
      host: '127.0.0.1',
      authKey: options.authKey,
      encrypted: true,
      storage: options.storage,
      username: options.username,
      password: options.password,
      guestName: options.guestName,
      realPort: options.realPort,
      guestPassword: options.guestPassword,
      shadowRules: SHADOW_RULES,
      mode: 'multiEnv|keepXFF',
      secureFilter: WHISTLE_SECURE_FILTER,
      pluginPaths: [
        path.join(PLUGINS_DIR, `whistle.nohost/${options.value}/node_modules`),
        NOHOST_PLUGINS,
      ],
    }, () => {
      curEnvList = proxy.rulesUtil.rules.list();
      setTimeout(() => callback(null, { port, envList: curEnvList }), 100);
    });
    let timer;
    const exitWhistleIfIdleTimeout = () => {
      clearTimeout(timer);
      timer = setTimeout(() => process.exit(), IDLE_TIMEOUT);
    };
    exitWhistleIfIdleTimeout();
    proxy.on('wsRequest', exitWhistleIfIdleTimeout);
    proxy.on('_request', exitWhistleIfIdleTimeout);
    syncData(proxy);
  });
};
