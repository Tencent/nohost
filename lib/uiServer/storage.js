const Storage = require('whistle/lib/rules/storage');
const path = require('path');
const { isLocalAddress, getSeverIp } = require('../util/address');
const { shasum } = require('../util/login');

const storage = new Storage(path.join(process.env.WHISTLE_PATH, '.nohost'));
const HOST_RE = /^https?:\/\/([^/]+)/;
const MAX_WHITE_LIST_LEN = 1024 * 32;
const MAX_DOMAIN_LEN = 256;
const MAX_TOKEN_LEN = 64;
const DEFAULT_PASSWORD = shasum('123456');
const ILLEGAL_DOMAIN_RE = /[^\s;,\w.-]/;
let domainList = [];
let curDomain;

const initData = () => {
  const domain = storage.getProperty('domain');
  if (!domain || ILLEGAL_DOMAIN_RE.test(domain) || domain.length > MAX_DOMAIN_LEN) {
    storage.setProperty('domain', '');
  }
};

initData();

const getString = (str) => {
  return typeof str === 'string' ? str : '';
};

const getReqDomain = (req) => {
  let { host } = req.headers;
  if (!host && HOST_RE.test(req.url)) {
    host = RegExp.$1;
  }
  return typeof host === 'string' ? host.split(':', 1)[0].trim() : '';
};

const getDomain = () => {
  return getString(storage.getProperty('domain'));
};

const getDomainList = () => {
  const domainStr = getDomain();
  if (domainStr !== curDomain) {
    curDomain = domainStr;
    domainList = curDomain.trim().split(/\s*[,\s;]\s*/);
  }
  return domainList;
};

const isUIDomain = (domain) => {
  return getDomainList().includes(domain);
};

exports.isUIRequest = (req) => {
  const domain = getReqDomain(req);
  return domain && (isUIDomain(domain) || isLocalAddress(domain));
};

exports.setAdmin = (admin) => {
  if (admin) {
    const { username, password } = admin;
    if (getString(username) && getString(password)) {
      storage.setProperty('admin', { username, password: shasum(password) });
    }
  }
};

exports.resetAdmin = () => {
  storage.removeProperty('admin');
};

exports.getAdmin = () => {
  const admin = storage.getProperty('admin') || '';
  const username = getString(admin.username) || 'admin';
  const password = getString(admin.password) || DEFAULT_PASSWORD;
  return { username, password };
};

exports.setWhiteList = (str) => {
  if (typeof str !== 'string' || str.length > MAX_WHITE_LIST_LEN) {
    return;
  }
  storage.setProperty('whiteList', str);
};

exports.getWhiteList = () => {
  return getString(storage.getProperty('whiteList'));
};

exports.setDomain = (str) => {
  if (typeof str !== 'string' || ILLEGAL_DOMAIN_RE.test(str) || str.length > MAX_DOMAIN_LEN) {
    return;
  }
  storage.setProperty('domain', str);
};

exports.getDomain = getDomain;

const isBaseUrl = d => /^[\w-]+(?:\.[\w-]+){1,}$/.test(d);

exports.getBaseUrl = () => {
  return getDomainList().find(isBaseUrl) || getSeverIp();
};

exports.setToken = (str) => {
  if (typeof str !== 'string' || str.length > MAX_TOKEN_LEN) {
    return;
  }
  storage.setProperty('token', str);
};

exports.getToken = () => {
  return getString(storage.getProperty('token'));
};
