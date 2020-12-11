
const startWhistle = require('whistle');
const path = require('path');
const { getPort, PLUGINS_DIR } = require('../util');

let result;
const customPluginPaths = [
  path.join(__dirname, '../../../account'),
  path.join(PLUGINS_DIR, 'whistle.nohost/lib/node_modules'),
  path.join(PLUGINS_DIR, 'whistle.nohost/node_modules'),
];

module.exports = () => {
  if (!result) {
    result = new Promise((resolve) => {
      getPort((port) => {
        const proxy = startWhistle({
          port,
          encrypted: true,
          storage: 'nohost_network_mode',
          mode: 'plugins|disableUpdateTips|hideLeftMenu',
          pluginPaths: customPluginPaths,
        }, () => resolve(port, proxy));
      });
    });
  }
  return result;
};
