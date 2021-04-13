const fs = require('fs');
const path = require('path');

const resolveValue = (text) => {
  return text.substring(text.indexOf('```'));
};
const INJECT_HTML = resolveValue(fs.readFileSync(path.join(__dirname, '../../../_rules.txt'), { encoding: 'utf8' })); // eslint-disable-line
const INJECT_RULE = 'htmlAppend://{whistle.nohost/inject.html}';
const WHISTLE_HOST = 'local.whistlejs.com';
let curBaseUrl;
let curPatterns;
let curRules;

module.exports = (ctx) => {
  const {
    patterns,
    getBaseUrl,
    getDomainList,
    preRules,
    postRules,
  } = ctx.accountMgr;
  const curRuntimeId = ctx.get('x-whistle-runtime-id');
  const isSelf = curRuntimeId === ctx.runtimeId;
  const baseUrl = !isSelf && getBaseUrl();
  const domainList = getDomainList().concat([WHISTLE_HOST]);
  if (baseUrl) {
    if (curBaseUrl !== baseUrl || curPatterns !== patterns) {
      curBaseUrl = baseUrl;
      curPatterns = patterns;
      let ignorePatterns = [];
      const injectRule = [`internal-proxy://${baseUrl} ${INJECT_RULE} enable://clientId|multiClient|safeHtml`];
      const normalRule = [`internal-proxy://${baseUrl} enable://clientId|multiClient`];
      curRules = [];
      patterns.forEach((item) => {
        if (item.ignore) {
          ignorePatterns.push(`excludeFilter://${item.pattern}`);
        } else if (item.button) {
          injectRule.push(item.pattern);
        } else {
          normalRule.push(item.pattern);
        }
      });
      ignorePatterns = ignorePatterns.join(' ');
      if (normalRule.length > 1) {
        normalRule.push(ignorePatterns);
        curRules.push(normalRule.join(' '));
      }
      if (injectRule.length > 1) {
        injectRule.push(ignorePatterns);
        curRules.push(injectRule.join(' '));
      }
      curRules.unshift(`internal-proxy://${baseUrl} ignore://rule|html enable://hide|proxyHost|clientId|multiClient ${domainList.join(' ')}`);
      curRules.push(`*/...whistle-path.5b6af7b9884e1165.../// reqHeaders://whistleInternalHost=${WHISTLE_HOST} enable://proxyTunnel`);
      curRules.push('\n', INJECT_HTML);
      curRules = preRules.concat(curRules).concat(postRules).join('\n');
    }
    ctx.body = curRules;
  } else {
    ctx.body = '';
  }
};
