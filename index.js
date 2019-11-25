const fse = require('fs-extra');
const { getWhistlePath } = require('whistle/lib/config');
const initConfig = require('./lib/config');
// 避免第三方模块没处理好异常导致程序crash
require('whistle/lib/util/patch');

const DEFAULT_PORT = 8080;

// 设置存储路径
process.env.WHISTLE_PATH = process.env.NOHOST_PATH || getWhistlePath();
fse.ensureDirSync(process.env.WHISTLE_PATH); // eslint-disable-line

module.exports = (options, cb) => {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  } else if (!options) {
    options = {};
  }
  if (options.debugMode) {
    process.env.PFORK_MODE = 'bind';
  }
  options.port = parseInt(options.port, 10) || DEFAULT_PORT;
  initConfig(options);
  require('./lib')(options, cb); // eslint-disable-line
};
