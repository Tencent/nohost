const Storage = require('whistle/lib/rules/storage');
const path = require('path');
const { parse } = require('url');
const https = require('https');
const { isLocalAddress } = require('../util/address');
const { shasum } = require('../util/login');
const parseDomain = require('../util/parseDomain');
const { registry } = require('../../package.json');

const registryOpts = parse(registry);
const storage = new Storage(path.join(process.env.WHISTLE_PATH, '.nohost'));
const HOST_RE = /^https?:\/\/([^/]+)/;
const MAX_DOMAIN_LEN = 128;
const DEFAULT_PASSWORD = shasum('123456');
const ILLEGAL_DOMAIN_RE = /[^\w.,\s-]/;
const noop = () => {};

const checkDomain = (domain) => {
  return typeof domain === 'string' && !ILLEGAL_DOMAIN_RE.test(domain) && domain.length < MAX_DOMAIN_LEN;
};

exports.checkDomain = checkDomain;

registryOpts.rejectUnauthorized = false;
const updateVersion = () => {
  const client = https.get(registryOpts, (res) => {
    res.on('error', noop);
    if (res.statusCode !== 200) {
      return;
    }
    let body;
    res.on('data', (chunk) => {
      body = body ? Buffer.concat([body, chunk]) : chunk;
    });
    res.on('end', () => {
      body = body && `${body}`;
      try {
        const ver = body && JSON.parse(body)['dist-tags'].latest;
        exports.latestVersion = ver;
        storage.setProperty('latestVersion', ver);
      } catch (e) {}
    });
  });
  client.on('error', noop);
  client.end();
};

exports.latestVersion = storage.getProperty('latestVersion');
updateVersion();
setInterval(updateVersion, 1000 * 60 * 30);

const initData = () => {
  const domain = storage.getProperty('domain');
  if (!checkDomain(domain)) {
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
  return storage.getProperty('domain');
};

const isUIDomain = (domain) => {
  return parseDomain(getDomain()).includes(domain);
};

exports.isUIRequest = (req) => {
  const domain = getReqDomain(req);
  return domain && (isUIDomain(domain) || isLocalAddress(domain));
};

const getAdmin = () => {
  const admin = storage.getProperty('admin') || '';
  const username = getString(admin.username) || 'admin';
  const password = getString(admin.password) || DEFAULT_PASSWORD;
  return { username, password };
};

exports.setAdmin = (admin) => {
  if (admin) {
    const { username, password } = admin;
    if (getString(username) && /^[\w.-]{1,32}$/.test(username) && getString(password)) {
      const oldAdmin = getAdmin();
      admin = { username, password: shasum(password) };
      storage.setProperty('admin', admin);
      return admin.username !== oldAdmin.username || admin.password !== oldAdmin.password;
    }
  }
};

exports.resetAdmin = () => {
  storage.removeProperty('admin');
};

exports.getAdmin = getAdmin;

exports.setDomain = (str) => {
  storage.setProperty('domain', str);
};

exports.getDomain = getDomain;
