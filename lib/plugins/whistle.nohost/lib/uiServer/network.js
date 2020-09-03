
const startWhistle = require('whistle');
const path = require('path');
const { getPort } = require('../util');

let result;

module.exports = () => {
  if (!result) {
    result = new Promise((resolve) => {
      getPort((port) => {
        const proxy = startWhistle({
          port,
          encrypted: true,
          storage: 'nohost_network_mode',
          mode: 'plugins|disableUpdateTips|hideLeftMenu',
          pluginPaths: path.join(__dirname, '../../../account'),
        }, () => resolve(port, proxy));
      });
    });
  }
  return result;
};
