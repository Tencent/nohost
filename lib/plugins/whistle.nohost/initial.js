const initAccountMgr = require('./lib/accountMgr');
const initEnvMgr = require('./lib/envMgr');
const { initPlugin } = require('./lib/util');

module.exports = (options) => {
  initPlugin(options);
  const accountMgr = initAccountMgr(options.storage);
  initEnvMgr(accountMgr);
};
