
const os = require('os');

const DEFAULT_PORT = 8080;

const getNumber = (str1, str2, str3) => {
  let num = parseInt(str1, 10);
  if (num > 0) {
    return num;
  }
  num = str2 && parseInt(str2, 10);
  if (num > 0) {
    return num;
  }
  num = str3 && parseInt(str3, 10);
  if (num > 0) {
    return num;
  }
};
const getValue = (n1, n2, n3) => {
  const { argv } = process;
  let index = argv.indexOf(n1);
  if (index === -1) {
    if (!n2) {
      return;
    }
    index = argv.indexOf(n2);
    if (index === -1) {
      if (!n3) {
        return;
      }
      index = argv.indexOf(n3);
    }
  }
  return index === -1 ? undefined : argv[index + 1];
};

const notEmptyStr = (str) => {
  return str && typeof str === 'string';
};

const getString = (h1, h2, h3) => {
  if (notEmptyStr(h1)) {
    return h1;
  }
  if (notEmptyStr(h2)) {
    return h2;
  }
  if (notEmptyStr(h3)) {
    return h3;
  }
};

exports.notEmptyStr = notEmptyStr;

const getPaths = (paths) => {
  if (typeof paths === 'string') {
    paths = paths.trim().split(/\s*[|,;]\s*/);
  } else if (!Array.isArray(paths)) {
    return;
  }
  paths = paths.filter((path) => {
    return path && typeof path === 'string';
  });
  return paths.length ? paths : undefined;
};

exports.parseArgv = (options) => {
  const {
    NOHOST_PORT,
    NOHOST_MODE,
    NOHOST_SOCKS_PORT,
    NOHOST_HTTPS_PORT,
    NOHOST_HTTP_PORT,
    NOHOST_WORKERS,
    NOHOST_SIN_CALLBACK,
    NOHOST_PLUGIN_PATH,
    NOHOST_PLUGINS_PATH,
  } = process.env;
  options = options || {};

  const port = getValue('-p', '--port');
  const workers = getValue('-w', '--worker', '--workers');
  const cluster = getNumber(options.cluster, options.workers);
  const mode = getValue('-M', '--mode') || NOHOST_MODE || options.mode || '';
  const debugMode = process.argv.includes('--debug');
  const {
    sniCallback,
    handleUpgrade,
    handleWebSocket,
    handleWebsocket,
    handleConnect,
    handleTunnel,
    handleRequest,
    handleHttp,
    rules,
    values,
    pluginsPath,
    pluginPath,
  } = options;

  let shadowRules = typeof rules === 'string' ? rules : null;
  if (values && typeof values === 'object') {
    shadowRules = { rules, values };
  }
  const pluginEnv = NOHOST_PLUGINS_PATH || NOHOST_PLUGIN_PATH;
  const pluginCli = getValue('--pluginsPath', '--pluginPath');
  const plugins = getPaths(pluginCli || pluginEnv || pluginsPath || pluginPath) || [];
  return {
    port: getNumber(port, NOHOST_PORT, options.port) || DEFAULT_PORT,
    cluster: debugMode ? 1 : getNumber(workers, NOHOST_WORKERS) || cluster || os.cpus().length,
    socksPort: getNumber(getValue('--socksPort'), NOHOST_SOCKS_PORT, options.socksPort),
    httpsPort: getNumber(getValue('--httpsPort'), NOHOST_HTTPS_PORT, options.httpsPort),
    httpPort: getNumber(getValue('--httpPort'), NOHOST_HTTP_PORT, options.httpPort),
    mode: `${mode}${debugMode ? '|plugins|pureProxy' : ''}`,
    globalData: {
      sniCallback: getValue('--sniCallback') || getString(NOHOST_SIN_CALLBACK, sniCallback),
      handleRequest: getString(handleRequest, handleHttp),
      handleUpgrade: getString(handleUpgrade, handleWebSocket, handleWebsocket),
      handleConnect: getString(handleConnect, handleTunnel),
    },
    pluginsPath: [__dirname].concat(plugins),
    shadowRules,
    debugMode,
  };
};
