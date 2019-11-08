const crypto = require('crypto');
const net = require('net');
const parseurl = require('parseurl');
const http = require('http');

const ENV_MAX_AGE = 60 * 60 * 24 * 3;
const CONF_KEY_RE = /^([\w-]{1,64}:?|[\w.-]{1,64}:)$/;

exports.AUTH_KEY = `${Date.now()}/${Math.random()}`;
exports.ENV_MAX_AGE = ENV_MAX_AGE;
exports.WHISTLE_ENV_HEADER = 'x-whistle-nohost-env';
exports.CONFIG_DATA_TYPE = 'PROXY_CONFIG';
exports.COOKIE_NAME = 'whistle_nohost_env';
exports.WHISTLE_RULE_VALUE = 'x-whistle-rule-value';
exports.BASE_URL = 'http://local.whistlejs.com/plugin.nohost/';

const STRIDE = 5;
let curPort = Math.floor(20001 + (10000 * Math.random()));
curPort = (curPort + 1) - (curPort % STRIDE);

const getPort = (callback) => {
  const server = http.createServer();
  server.on('error', () => {
    if (++curPort % 5 === 0) {
      ++curPort;
    }
    getPort(callback);
  });
  server.listen(curPort, () => {
    server.removeAllListeners();
    server.close(() => callback(curPort));
  });
};

exports.getPort = getPort;

/* eslint-disable no-empty */
const shasum = (str) => {
  if (typeof str !== 'string') {
    str = '';
  }
  const result = crypto.createHash('sha1');
  result.update(str);
  return result.digest('hex');
};
exports.shasum = shasum;

const decodeURIComponentSafe = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  try {
    return decodeURIComponent(str);
  } catch (e) {}
  return str;
};

exports.decodeURIComponentSafe = decodeURIComponentSafe;

const parseJSON = (str) => {
  try {
    const result = JSON.parse(str);
    if (typeof result === 'object') {
      return result;
    }
  } catch (e) {}
};

exports.parseJSON = parseJSON;

const transformReq = (req, port, host) => {
  const options = parseurl(req);
  options.host = host || '127.0.0.1';
  options.method = req.method;
  options.headers = req.headers;
  delete options.headers.referer;
  delete options.protocol;
  delete options.hostname;
  if (port > 0) {
    options.port = port;
  }
  return new Promise((resolve, reject) => {
    const client = http.request(options, resolve);
    client.on('error', reject);
    req.pipe(client);
  });
};

exports.transformReq = transformReq;
exports.transformWhistle = async (ctx, port) => {
  const { req } = ctx;
  const res = await transformReq(req, port);
  ctx.status = res.statusCode;
  ctx.set(res.headers);
  ctx.body = res;
};

exports.parseConfig = (ctn) => {
  if (typeof ctn !== 'string') {
    return;
  }
  ctn = ctn.trim().split(/\r\n|\r|\n/g);
  let conf;
  ctn.forEach((line) => {
    line = line.replace(/#.*$/, '').trim().split(/\s+/);
    if (line.length) {
      let key = line[0].toLowerCase();
      if (!key || !CONF_KEY_RE.test(key)) {
        return;
      }
      conf = conf || {};
      key = key.replace(':', '');
      if (key !== 'host') {
        key = `x-nohost-${key}`;
      }
      if (conf[key] == null && (!conf.headers || conf.headers[key] == null)) {
        if (key === 'host') {
          conf.host = line[1];
        } else {
          conf.headers = conf.headers || {};
          conf.headers[key] = line[1] || '';
        }
      }
    }
  });
  return conf;
};

const KEY_RE = /(?:@([^\s@]+)|\{([^\s@]+)\})/ig;
const resolveConf = (ctn, values) => {
  if (!ctn || !values) {
    return ctn;
  }
  return ctn.replace(KEY_RE, (all, $1, $2) => {
    return values[$1 || $2] || '';
  });
};

exports.resolveConfList = (list, publicList) => {
  if (!list.length || !publicList || !publicList.length) {
    return list;
  }
  const map = {};
  publicList.forEach((conf) => {
    map[conf.name] = conf.rules || '';
  });
  list.forEach((conf) => {
    conf.rules = resolveConf(conf.rules, map);
  });
  return list;
};

let REQ_FROM_HEADER;
let RULE_VALUE_HEADER;

exports.initPlugin = (options) => {
  REQ_FROM_HEADER = options.REQ_FROM_HEADER;
  RULE_VALUE_HEADER = options.RULE_VALUE_HEADER;
  exports.config = options.config;
  exports.pluginConfig = options.data;
  if (options.data.baseUrl) {
    exports.BASE_URL = `http://${options.data.baseUrl}/`;
  }
};

exports.getRuleValue = (ctx) => {
  const ruleValue = ctx.get(RULE_VALUE_HEADER);
  return ruleValue ? decodeURIComponent(ruleValue) : '';
};

exports.isFromComposer = (ctx) => {
  return ctx.get(REQ_FROM_HEADER) === 'W2COMPOSER';
};

exports.getDomain = function (hostname) {
  if (net.isIP(hostname)) {
    return hostname;
  }
  let list = hostname.split('.');
  const len = list.length;
  if (len < 3) {
    return hostname;
  }
  let wildcard = len > 3;
  if (wildcard) {
    list = list.slice(-3);
  }

  if (list[1].length > 3 || list[1] === 'url' || list[2] === 'com') {
    wildcard = true;
    list = list.slice(-2);
  }
  if (wildcard) {
    list.unshift('');
  }
  return list.join('.');
};

exports.getClientId = (ctx) => {
  const clientId = ctx.get('x-whistle-nohost-client-id')
    || ctx.get('x-whistle-client-id');
  if (clientId && typeof clientId === 'string') {
    return (clientId.trim() || ctx.ip).substring(0, 100);
  }
  return ctx.ip;
};
