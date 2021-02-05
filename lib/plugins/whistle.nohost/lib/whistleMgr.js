const p = require('pfork');
const path = require('path');
const accountMgr = require('./accountMgr');
const {
  CONFIG_DATA_TYPE,
  AUTH_KEY,
  pluginConfig,
} = require('./util');

const { realPort } = pluginConfig;
const GUEST_AUTH = { guestName: '-' };
const WHISTLE_WORKER = path.join(__dirname, 'whistle');
const DELAY = 6000;
const UPDATE_INTERVAL = 5000;
const cache = {};

exports.fork = (account) => {
  if (!account) {
    return;
  }
  const { name, password } = account;
  if (cache[name]) {
    return cache[name];
  }
  const getAccountData = () => {
    const data = {
      type: CONFIG_DATA_TYPE,
      username: account.name,
      password: account.password,
      guest: accountMgr.isEnableGuest() ? GUEST_AUTH : null,
    };
    return data;
  };
  cache[name] = new Promise((resolve, reject) => {
    const guestName = accountMgr.isEnableGuest() ? '-' : undefined;
    p.fork({
      username: name,
      authKey: AUTH_KEY,
      password,
      guestName,
      storage: `whistle.nohost/${name}`,
      script: WHISTLE_WORKER,
      value: name,
      realPort,
      storageServer: accountMgr.storageServer,
    }, (err, result, child) => {
      if (err) {
        delete cache[name];
        return reject(err);
      }
      const { port, envList } = result;
      resolve(port);
      accountMgr.addEnvList(name, envList);
      let timer;
      const updateAuth = () => {
        account = account && accountMgr.getAccount(account.name);
        if (!account) {
          return;
        }
        child.sendData(getAccountData());
        timer = setTimeout(updateAuth, UPDATE_INTERVAL);
      };
      timer = setTimeout(updateAuth, UPDATE_INTERVAL);
      child.on('exit', () => {
        clearTimeout(timer);
        delete cache[name];
      });
      child.on('data', (data) => {
        const type = data && data.type;
        if (type !== CONFIG_DATA_TYPE) {
          return;
        }
        account = account && accountMgr.getAccount(account.name);
        if (!account) {
          return;
        }
        const accountData = getAccountData();
        accountData.index = data.index;
        child.sendData(accountData);
        accountMgr.addEnvList(name, data.envList);
      });
    });
  });
  return cache[name];
};
exports.kill = (name) => {
  p.kill({
    script: WHISTLE_WORKER,
    value: name,
  }, DELAY);
};
