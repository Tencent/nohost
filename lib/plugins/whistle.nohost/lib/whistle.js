const startWhistle = require('whistle');
const path = require('path');
const HOME_DIR = require('os').homedir();
const { CONFIG_DATA_TYPE, getPort, loadModule, PLUGINS_DIR } = require('./util');

const WHISTLE_SECURE_FILTER = path.resolve(HOME_DIR, 'nohost/whistleSecureFilter.js');
const IDLE_TIMEOUT = 6 * 60 * 1000;

let index = 0;
let updatedIndex;
let curEnvList = [];
let config;
let proxy;
let isHeadless;

const getShadowRules = (options) => {
  const shadowRules = isHeadless ? '* responseFor://name=x-upstream' : '* responseFor://name=x-upstream,req.x-whistle-nohost-env';
  return options.defaultRules ? `${options.defaultRules}\n${shadowRules}` : shadowRules;
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
      runtimeInfo: proxy.getRuntimeInfo(),
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
  const projectPluginPaths = options.cluster ? [] : [
    path.join(__dirname, '../../account'),
    path.join(__dirname, '../../../../node_modules'),
  ];
  const username = options.value || '$';
  const isRulesMode = username === '$';
  const customPluginPaths = options.pluginPaths || [
    path.join(PLUGINS_DIR, `whistle.nohost/${username}/lib/node_modules`),
    path.join(PLUGINS_DIR, `whistle.nohost/${username}/node_modules`),
    path.join(PLUGINS_DIR, 'whistle.nohost/lib/node_modules'),
    path.join(PLUGINS_DIR, 'whistle.nohost/node_modules'),
  ];
  const pluginPaths = projectPluginPaths.concat(customPluginPaths);
  isHeadless = /^\$\d+/.test(username);
  let mode = 'multiEnv|disableUpdateTips|keepXFFs|x-forwarded-proto';
  if (options.cluster) {
    mode = `${mode}|headless|disableCustomCerts`;
  } else if (options.worker) {
    mode = `${mode}|plugins|hideLeftMenu`;
  }
  if (process.env.PFORK_MODE === 'bind') {
    pluginPaths.unshift(process.cwd());
  }
  getPort((port) => {
    proxy = startWhistle({
      port,
      host: '127.0.0.1',
      cmdName: 'n2',
      authKey: options.authKey,
      encrypted: true,
      storage: options.storage,
      baseDir: process.env.NOHOST_BADE_DIR,
      username,
      password: isRulesMode ? `${Math.random()}` : options.password,
      guestName: isRulesMode ? '' : options.guestName,
      realPort: options.realPort,
      guestPassword: options.guestPassword,
      shadowRules: getShadowRules(options),
      mode: `${mode}${isRulesMode ? '|rules' : ''}`,
      secureFilter: WHISTLE_SECURE_FILTER,
      projectPluginPaths,
      customPluginPaths,
      pluginPaths,
      dnsServer: options.dnsServer,
      addon: options.accountPluginPath,
      pluginsDataMap: {
        storage: {
          storageServer: options.storageServer,
        },
      },
    }, () => {
      curEnvList = proxy.rulesUtil.rules.list();
      const {
        REMOTE_ADDR_HEAD: remoteAddrHead,
        REMOTE_PORT_HEAD: remotePortHead,
      } = proxy.config;
      setTimeout(() => callback(null, {
        port,
        remoteAddrHead,
        remotePortHead,
        envList: curEnvList,
      }), 100);
    });
    let timer;
    const exitWhistleIfIdleTimeout = () => {
      clearTimeout(timer);
      timer = setTimeout(() => process.exit(), IDLE_TIMEOUT);
    };
    exitWhistleIfIdleTimeout();
    config = loadModule('whistle/lib/config');
    config.baseDirHash = '';
    proxy.on('tunnelRequest', exitWhistleIfIdleTimeout);
    proxy.on('wsRequest', exitWhistleIfIdleTimeout);
    proxy.on('_request', exitWhistleIfIdleTimeout);
    syncData();
  });
};
