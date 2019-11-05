const Storage = require('whistle/lib/rules/storage');
const path = require('path');
const { isLocalAddress } = require('../util/address');

const storage = new Storage(path.join(process.env.WHISTLE_PATH, '.nohost'));
const HOST_RE = /^https?:\/\/([^/]+)/;
const MAX_WHITE_LIST_LEN = 1024 * 32;
const MAX_DOMAIN_LIST_LEN = 1024;
const MAX_TOKEN_LIST_LEN = 256;

const getString = (str) => {
  return typeof str === 'string' ? str : '';
};

const getDomain = (req) => {
  let { host } = req.headers;
  if (!host && HOST_RE.test(req.url)) {
    host = RegExp.$1;
  }
  return typeof host === 'string' ? host.split(':', 1)[0].trim() : '';
};

const isUIDomain = (domain) => {
  return domain === 'imweb.punk.oa.com';
};

exports.isUIRequest = (req) => {
  const domain = getDomain(req);
  return domain && (isUIDomain(domain) || isLocalAddress(domain));
};

exports.setAdmin = (admin) => {
  if (admin) {
    const { username, password } = admin;
    if (getString(username) && getString(password)) {
      storage.setProperty('admin', { username, password });
    }
  }
};

exports.getAdmin = () => {
  return storage.getProperty('admin') || {};
};

exports.setWhiteList = (str) => {
  if (typeof str !== 'string' || str.length > MAX_WHITE_LIST_LEN) {
    return;
  }
  storage.setProperty('whiteList', str);
};

exports.getWhiteList = () => {
  return storage.getProperty('whiteList');
};

exports.setDomainList = (str) => {
  if (typeof str !== 'string' || str.length > MAX_DOMAIN_LIST_LEN) {
    return;
  }
  storage.setProperty('domainList', str);
};

exports.getDomainList = () => {
  return storage.getProperty('domainList');
};

exports.setToken = (str) => {
  if (typeof str !== 'string' || str.length > MAX_TOKEN_LIST_LEN) {
    return;
  }
  storage.setProperty('token', str);
};

exports.getToken = () => {
  return storage.getProperty('token');
};
