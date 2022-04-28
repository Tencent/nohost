const { parse: parseUrl } = require('url');
const hparser = require('hparser');
const {
  onClose,
  getRawHeaders,
  request,
  tunnel,
  upgrade,
  connect,
  getClientIp,
  getClientPort,
} = require('./connect');
const { getServers, isFinished, decode, getJSON, addPlugins } = require('./util');
const { proxy, writeError, writeHead, writeBody } = require('./connect');

const INTERVAL = 10000;
const ONE_MINU = 1000 * 60;
const SPACE_NAME = 'x-whistle-nohost-space-name';
const GROUP_NAME = 'x-whistle-nohost-group-name';
const ENV_NAME = 'x-whistle-nohost-env-name';
const ENV_HEAD = 'x-whistle-nohost-env';
const NOHOST_RULE = 'x-whistle-rule-value';
const NOHOST_VALUE = 'x-whistle-key-value';
const CLIENT_ID = 'x-whistle-client-id';
const CLIENT_ID_FILTER = 'x-whistle-filter-client-id';
const ROUTE_RE = /([?&])route=([^?&]+)($|&)/;
const ROUTE_VALUE_RE = /^[\w.:/=+-]{1,100}$/;

const isString = (str) => {
  return str && typeof str === 'string';
};

const getString = (obj) => {
  if (!obj || typeof obj === 'string') {
    return obj;
  }
  if (typeof obj === 'object') {
    try {
      return JSON.stringify(obj);
    } catch (e) {}
  }
};

const addOptions = (req, options) => {
  if (!options) {
    return;
  }
  const { headers, isUIRequest } = req;
  delete headers['x-whistle-nohost-rule'];
  delete headers['x-whistle-nohost-value'];
  const addHeader = (name, value) => {
    if (isString(value)) {
      headers[name] = encodeURIComponent(value);
    } else {
      delete headers[name];
    }
  };
  if (isUIRequest) {
    addHeader(CLIENT_ID_FILTER, options.clientId);
  } else {
    addHeader(NOHOST_RULE, options.rules);
    addHeader(NOHOST_VALUE, getString(options.values));
    addHeader(CLIENT_ID, options.clientId);
    addPlugins(headers, options.plugins || options);
  }
  addHeader(SPACE_NAME, options.spaceName || options.space);
  addHeader(GROUP_NAME, options.groupName || options.group);
  addHeader(ENV_NAME, options.envName || options.env);
};

class Router {
  constructor(servers) {
    let loadServers;
    if (typeof servers === 'function') {
      loadServers = servers;
      servers = loadServers();
    }
    if (!loadServers && !Array.isArray(servers)) {
      this._nohostAddress = servers ? {
        host: servers.host,
        port: servers.port,
      } : {};
      return;
    }
    this._index = 0;
    this._statusCache = {};
    let curMinute = Math.floor(Date.now() / ONE_MINU);
    let index = 0;
    this._intervalTimer = setInterval(async () => {
      const minute = Math.floor(Date.now() / ONE_MINU);
      if (loadServers && ++index % 5 === 0) {
        index = 0;
        try {
          servers = await loadServers();
          this.update(servers);
        } catch (e) {}
      }
      if (minute === curMinute) {
        return;
      }
      curMinute = minute;
      const cache = this._statusCache;
      Object.keys(cache).forEach((key) => {
        if (cache[key].initTime !== minute) {
          delete cache[key];
        }
      });
    }, 3000);
    this._intervalTimer.unref();
    this.update(servers);
  }

  _connectDefault(req, res, callback) {
    const { servers } = this._result;
    const i = this._index++ % servers.length;
    if (this._index >= Number.MAX_SAFE_INTEGER) {
      this._index = 0;
    }
    req.headers[ENV_HEAD] = '$';
    const server = servers[i];
    if (callback) {
      callback(server);
    }
    return proxy(server, req, res);
  }

  _getStatus(space, group, env) {
    const { base64, servers } = this._result;
    if (!this._base64 || this._base64 !== base64) {
      this._statusCache = {};
      this._base64 = base64;
    }
    const query = `?space=${space}&group=${group}&env=${env || ''}`;
    // 考虑到实际使用场景不会有那么多在线的环境，这里不使用 LRU cache
    let status = this._statusCache[query];
    if (!status) {
      const options = parseUrl(`${servers[0].statusUrl}${query}`);
      options.headers = { 'x-nohost-servers': base64 };
      status = getJSON(options);
      status.initTime = Math.floor(Date.now() / ONE_MINU);
      this._statusCache[query] = status;
    }
    return status;
  }

  update(servers) {
    this._servers = servers || [];
    if (this._pending) {
      this._waiting = true;
      return;
    }
    clearTimeout(this._timer);
    if (this._destroyed) {
      return;
    }
    this._pending = getServers(this._servers);
    this._pending.then((result) => {
      this._result = result || '';
      this._pending = null;
      if (this._waiting) {
        this._waiting = false;
        this.update(this._servers);
      } else {
        this._timer = setTimeout(() => this.update(this._servers), INTERVAL);
      }
    });
    return this._pending;
  }

  existsHost(host) {
    return this._result ? this._result.map[host] : false;
  }

  async proxy(req, res, options) {
    onClose(res);
    let callback;
    if (options) {
      if (typeof options === 'function') {
        callback = options;
        options = null;
      } else if (typeof options.callback === 'function') {
        callback = options.callback;
      }
    }
    const { headers, isUIRequest } = req;
    if (this._nohostAddress) {
      // options?.host 兼容性？
      const server = options && options.host ? options : this._nohostAddress;
      if (isUIRequest) {
        headers['x-whistle-nohost-ui'] = 1;
        headers['x-whistle-real-host'] = 'local.whistlejs.com';
      } else {
        addPlugins(headers, server.plugins || server);
      }
      if (callback) {
        callback(server);
      }
      return proxy(server, req, res);
    }
    let result = this._result;
    if (result == null) {
      result = await this._pending;
    }
    if (!result || isFinished(req)) {
      throw new Error(result ? 'request is finished.' : 'not found nohost server.');
    }
    addOptions(req, options);
    const space = headers[SPACE_NAME];
    const group = headers[GROUP_NAME];
    const name = headers[ENV_NAME];
    if (!space || !group) {
      if (isUIRequest) {
        throw new Error('space & group is required.');
      }
      return this._connectDefault(req, res, callback);
    }
    let status;
    let needRoute;
    if (isUIRequest && ROUTE_RE.test(req.url)) {
      let host = decode(RegExp.$2);
      if (host === '!required!') {
        needRoute = true;
      } else if (ROUTE_VALUE_RE.test(host)) {
        host = Buffer.from(host, 'base64').toString();
        if (this.existsHost(host)) {
          host = host.split(':');
          status = { host: host[0], port: host[1] };
        }
      }
    }
    status = status || await this._getStatus(space, group, name);
    if (!status || !status.host) {
      return this._connectDefault(req, res, callback);
    }
    const env = `$${status.index}`;
    if (isUIRequest) {
      headers['x-whistle-nohost-ui'] = 1;
      headers['x-whistle-filter-key'] = name ? ENV_NAME : ENV_HEAD;
      headers['x-whistle-filter-value'] = name || env;
      let path = req.url || '/';
      if (path[0] !== '/') {
        path = parseUrl(req.url).path;
      }
      req.url = `/account/${env}${path}`;
      if (needRoute) {
        const route = Buffer.from(`${status.host}:${status.port}`).toString('base64');
        req.url = req.url.replace(ROUTE_RE, `$1route=${route}$3`);
      }
    }
    headers[ENV_HEAD] = env;
    if (callback) {
      callback(status);
    }
    return proxy(status, req, res);
  }

  proxyUI(req, res, options) {
    req.isUIRequest = true;
    return this.proxy(req, res, options);
  }

  destroy() {
    clearTimeout(this._timer);
    clearInterval(this._intervalTimer);
    this._destroyed = true;
    this._statusCache = {};
  }
}

const router = new Router();

Router.proxy = router.proxy.bind(router);
Router.proxyUI = router.proxyUI.bind(router);
Router.SPACE_NAME = SPACE_NAME;
Router.GROUP_NAME = GROUP_NAME;
Router.ENV_NAME = ENV_NAME;
Router.NOHOST_RULE = NOHOST_RULE;
Router.NOHOST_VALUE = NOHOST_VALUE;
Router.CLIENT_ID = CLIENT_ID;
Router.CLIENT_ID_FILTER = CLIENT_ID_FILTER;
Router.request = request;
Router.upgrade = upgrade;
Router.tunnel = tunnel;
Router.connect = connect;
Router.getClientIp = getClientIp;
Router.getClientPort = getClientPort;
Router.writeError = writeError;
Router.writeHead = writeHead;
Router.writeBody = writeBody;
Router.getRawHeaders = getRawHeaders;
Router.onClose = onClose;
Router.hparser = hparser;
module.exports = Router;
