
const isBaseUrl = d => /^[\w-]+(?:\.[\w-]+){1,}$/.test(d);
const SEP_RE = /\s*[,\s]\s*/;
let domainList = [];
let curDomain;

const parseDomain = (domainStr) => {
  if (domainStr !== curDomain) {
    curDomain = domainStr;
    domainList = curDomain.trim().split(SEP_RE).filter(isBaseUrl);
  }
  return domainList;
};

module.exports = (str) => {
  return !str || typeof str !== 'string' ? [] : parseDomain(str);
};
