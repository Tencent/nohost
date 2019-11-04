const initAccountMgr = require('./accountMgr');
const initEnvMgr = require('./envMgr');
const { initPlugin } = require('./util');

module.exports = (options) => {
  const accountMgr = initAccountMgr(options.storage);
  initEnvMgr(accountMgr);
  initPlugin(options);
};
