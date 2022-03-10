
const startWhistle = require('whistle');
const path = require('path');
const { getNohostPluginsPath, getPort, PLUGINS_DIR } = require('../util');

let result;
const projectPluginsPath = [
  path.join(__dirname, '../../../account'),
];
const customPluginsPath = [
  path.join(getNohostPluginsPath(), 'worker_plugins'),
];
const pluginsPath = [
  path.join(PLUGINS_DIR, 'whistle.nohost/lib/node_modules'),
  path.join(PLUGINS_DIR, 'whistle.nohost/node_modules'),
];

module.exports = () => {
  if (!result) {
    result = new Promise((resolve) => {
      getPort((port) => {
        const proxy = startWhistle({
          globalData: 'Network',
          cmdName: 'n2',
          port,
          encrypted: true,
          storage: 'nohost_network_mode',
          mode: 'plugins|disableUpdateTips|hideLeftMenu',
          projectPluginsPath,
          customPluginsPath,
          pluginsPath,
        }, () => resolve(port, proxy));
      });
    });
  }
  return result;
};
