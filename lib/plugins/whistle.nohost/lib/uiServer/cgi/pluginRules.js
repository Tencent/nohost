const fs = require('fs');
const path = require('path');

const resolveValue = (text) => {
  return text.substring(text.indexOf('```'));
};
const INJECT_HTML = ['\n', resolveValue(fs.readFileSync(path.join(__dirname, '../../../_rules.txt'), { encoding: 'utf8' }))]; // eslint-disable-line
const INJECT_RULE = ' htmlAppend://{whistle.nohost/inject.html}';
let curBaseUrl;
let curPatterns;
let curRules;

module.exports = (ctx) => {
  const { patterns, getBaseUrl } = ctx.accountMgr;
  const baseUrl = getBaseUrl();
  if (baseUrl) {
    if (curBaseUrl !== baseUrl || curPatterns !== patterns) {
      curBaseUrl = baseUrl;
      curPatterns = patterns;
      curRules = patterns.map((pattern) => {
        if (typeof pattern === 'string') {
          return `${pattern} internal-proxy://${baseUrl}${INJECT_RULE}`;
        }
        return `${pattern.pattern} internal-proxy://${baseUrl}`;
      }).concat(INJECT_HTML);
      curRules.push(`${baseUrl} internal-proxy://${baseUrl} ignore://rule enable://hide`);
      curRules = curRules.join('\n');
    }
    ctx.body = curRules;
  } else {
    ctx.body = '';
  }
};
