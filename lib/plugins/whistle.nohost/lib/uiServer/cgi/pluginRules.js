const fs = require('fs');
const path = require('path');

const resolveValue = (text) => {
  return text.substring(text.indexOf('```'));
};
const INJECT_HTML = resolveValue(fs.readFileSync(path.join(__dirname, '../../../_rules.txt'), { encoding: 'utf8' })); // eslint-disable-line
const INJECT_RULE = ' htmlAppend://{whistle.nohost/inject.html}';
let curBaseUrl;
let curPatterns;
let curRules;

module.exports = (ctx) => {
  const { patterns, getBaseUrl } = ctx.accountMgr;
  const isSelf = ctx.get('x-whistle-runtime-id') === ctx.runtimeId;
  const baseUrl = !isSelf && getBaseUrl();
  if (baseUrl) {
    if (curBaseUrl !== baseUrl || curPatterns !== patterns) {
      curBaseUrl = baseUrl;
      curPatterns = patterns;
      curRules = patterns.map((item) => {
        if (item.ignore) {
          return `${item.pattern} ignore://proxy`;
        }
        return `${item.pattern} internal-proxy://${baseUrl}${item.button ? INJECT_RULE : ''}`;
      });
      const domain = baseUrl.split(':', 1)[0];
      curRules.push(`${domain} internal-proxy://${baseUrl} ignore://rule enable://hide|proxyHost`);
      curRules.push('\n', INJECT_HTML);
      curRules = curRules.join('\n');
    }
    ctx.body = curRules;
  } else {
    ctx.body = '';
  }
};
