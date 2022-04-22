const loadModule = require;

const getHandler = (fn) => {
  fn = fn && loadModule(fn);
  return typeof fn === 'function' ? fn : undefined;
};

module.exports = async (options) => {
  const {
    handleUpgrade,
    handleConnect,
    handleRequest,
  } = options.config.globalData || {};
  options.handlers = {
    http: getHandler(handleRequest),
    ws: getHandler(handleUpgrade),
    tunnel: getHandler(handleConnect),
  };
};
