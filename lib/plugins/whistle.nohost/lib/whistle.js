const startWhistle = require('whistle');
const path = require('path');
const HOME_DIR = require('os').homedir();
const { CONFIG_DATA_TYPE, getPort, loadMoudle, PLUGINS_DIR } = require('./util');

const WHISTLE_SECURE_FILTER = path.resolve(HOME_DIR, 'nohost/whistleSecureFilter.js');
const IDLE_TIMEOUT = 6 * 60 * 1000;
const SHADOW_RULES = '* responseFor://name=x-upstream,req.x-whistle-nohost-env';

let index = 0;
let updatedIndex;
let curEnvList = [];
let config;
let proxy;

const getShadowRules = (options) => {
  return options.defaultRules ? `${options.defaultRules}\n${SHADOW_RULES}` : SHADOW_RULES;
};

const syncData = () => {
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
    const shadowRules = getShadowRules(data);
    if (config && shadowRules !== config.shadowRules) {
      config.shadowRules = shadowRules;
      proxy.rulesUtil.parseRules();
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
  const projectPluginPaths = [path.join(__dirname, '../../account')];
  const username = options.value || '$';
  const isRulesMode = username === '$';
  const customPluginPaths = [
    path.join(PLUGINS_DIR, `whistle.nohost/${username}/lib/node_modules`),
    path.join(PLUGINS_DIR, `whistle.nohost/${username}/node_modules`),
    path.join(PLUGINS_DIR, 'whistle.nohost/lib/node_modules'),
    path.join(PLUGINS_DIR, 'whistle.nohost/node_modules'),
  ];
  getPort((port) => {
    proxy = startWhistle({
      port,
      host: '127.0.0.1',
      cmdName: 'n2',
      authKey: options.authKey,
      encrypted: true,
      storage: options.storage,
      username,
      password: isRulesMode ? `${Math.random()}` : options.password,
      guestName: isRulesMode ? '' : options.guestName,
      realPort: options.realPort,
      guestPassword: options.guestPassword,
      shadowRules: getShadowRules(options),
      mode: `multiEnv|disableUpdateTips|keepXFF${options.worker ? '|plugins|hideLeftMenu' : ''}${isRulesMode ? '|rules' : ''}`,
      secureFilter: WHISTLE_SECURE_FILTER,
      projectPluginPaths,
      customPluginPaths,
      pluginPaths: projectPluginPaths.concat(customPluginPaths),
      pluginsDataMap: {
        storage: {
          storageServer: options.storageServer,
        },
      },
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
    config = loadMoudle('whistle/lib/config');
    config.baseDirHash = '';
    proxy.on('tunnelRequest', exitWhistleIfIdleTimeout);
    proxy.on('wsRequest', exitWhistleIfIdleTimeout);
    proxy.on('_request', exitWhistleIfIdleTimeout);
    syncData();
  });
};
