const Storage = require('whistle/lib/rules/storage');
const { isLocalAddress } = require('../util/address');

const HOST_RE = /^https?:\/\/([^/]+)/;

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
