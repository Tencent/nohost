const p = require('pfork');
const path = require('path');
const accountMgr = require('./accountMgr');
const {
  CONFIG_DATA_TYPE,
  AUTH_KEY,
  config,
  pluginConfig,
  config: { certDir },
} = require('./util');

const {
  rules, values, guestName, guestPassword,
} = pluginConfig;

const WHISTLE_WORKER = path.join(__dirname, 'whistle');
const DELAY = 6000;
const UPDATE_INTERVAL = 5000;

exports.fork = (account) => {
  if (!account) {
    return;
  }

  const { name, password } = account;
  return new Promise((resolve, reject) => {
    p.fork({
      username: name,
      authKey: AUTH_KEY,
      password,
      rules,
      values,
      certDir,
      guestName,
      guestPassword,
      storage: `whistle.nohost/${name}`,
      script: WHISTLE_WORKER,
      value: name,
      uiport: config.uiport,
    }, (err, result, child) => {
      if (err) {
        return reject(err);
      }
      const { port, envList } = result;
      resolve(port);
      if (child.inited) {
        return;
      }
      child.inited = true;
      accountMgr.addEnvList(name, envList);
      let timer;
      const updateAuth = () => {
        account = account && accountMgr.getAccount(account.name);
        if (!account) {
          return;
        }
        child.sendData({
          type: CONFIG_DATA_TYPE,
          username: account.name,
          password: account.password,
        });
        timer = setTimeout(updateAuth, UPDATE_INTERVAL);
      };
      timer = setTimeout(updateAuth, UPDATE_INTERVAL);
      child.on('exit', () => clearTimeout(timer));
      child.on('data', (data) => {
        const type = data && data.type;
        if (type !== CONFIG_DATA_TYPE) {
          return;
        }
        account = account && accountMgr.getAccount(account.name);
        if (!account) {
          return;
        }
        child.sendData({
          type: CONFIG_DATA_TYPE,
          username: account.name,
          password: account.password,
          index: data.index,
        });
        accountMgr.addEnvList(name, data.envList);
      });
    });
  });
};
exports.kill = (name) => {
  p.kill({
    script: WHISTLE_WORKER,
    value: name,
  }, DELAY);
};
