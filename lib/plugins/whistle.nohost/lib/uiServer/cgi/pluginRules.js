const fs = require('fs');
const path = require('path');

const resolveValue = (text) => {
  return text.substring(text.indexOf('```'));
};
const INJECT_HTML = resolveValue(fs.readFileSync(path.join(__dirname, '../../../_rules.txt'), { encoding: 'utf8' })); // eslint-disable-line
const INJECT_RULE = 'htmlAppend://{whistle.nohost/inject.html}';
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
  const domainList = getDomainList();
  if (baseUrl) {
    if (curBaseUrl !== baseUrl || curPatterns !== patterns) {
      curBaseUrl = baseUrl;
      curPatterns = patterns;
      const ignorePatterns = [`ignore://${curRuntimeId ? 'internal-' : ''}proxy`];
      const injectRule = `internal-proxy://${baseUrl} ${INJECT_RULE} enable://clientId|multiClient|safeHtml`;
      const normalRule = `internal-proxy://${baseUrl} enable://clientId|multiClient`;
      let patternList = [];
      curRules = [];
      let needButton = -1;
      patterns.forEach((item) => {
        if (item.ignore) {
          return ignorePatterns.push(item.pattern);
        }
        if (needButton !== item.button) {
          needButton = item.button;
          if (patternList.length > 1) {
            curRules.push(patternList.join(' '));
          }
          patternList = [needButton ? injectRule : normalRule];
        }
        patternList.push(item.pattern);
      });
      if (patternList.length > 1) {
        curRules.push(patternList.join(' '));
      }
      if (ignorePatterns.length > 1) {
        curRules.unshift(ignorePatterns.join(' '));
      }
      if (domainList.length) {
        curRules.unshift(`ignore://rule|html enable://hide|proxyHost|clientId|multiClient ${domainList.join(' ')}`);
      }
      curRules.push('\n', INJECT_HTML);
      curRules = preRules.concat(curRules).concat(postRules).join('\n');
    }
    ctx.body = curRules;
  } else {
    ctx.body = '';
  }
};
