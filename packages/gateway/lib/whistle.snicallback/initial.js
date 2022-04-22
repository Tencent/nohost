const loadModule = require;

module.exports = (options) => {
  let { sniCallback } = options.config.globalData || {};
  if (sniCallback && typeof sniCallback === 'string') {
    sniCallback = loadModule(sniCallback);
    if (typeof sniCallback === 'function') {
      options.sniCallback = sniCallback;
    }
  }
};
