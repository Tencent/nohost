const fs = require('fs');
const path = require('path');

const resolveValue = (text) => {
  return text.substring(text.indexOf('```'));
};
const INJECT_HTML = resolveValue(fs.readFileSync(path.join(__dirname, '../../../_rules.txt'), { encoding: 'utf8' })); // eslint-disable-line
const INJECT_RULE = ' htmlAppend://{whistle.nohost/inject.html}';

module.exports = (ctx) => {
  const { priPatterns, pubPatterns, getBaseUrl } = ctx.accountMgr;
  const baseUrl = getBaseUrl();
  if (baseUrl) {
    ctx.body = priPatterns.concat(pubPatterns).map((pattern) => {
      return `${pattern} internal-proxy://${baseUrl}${priPatterns.includes(pattern) ? '' : INJECT_RULE}`;
    }).concat([INJECT_HTML]).join('\n');
  } else {
    ctx.body = '';
  }
};
