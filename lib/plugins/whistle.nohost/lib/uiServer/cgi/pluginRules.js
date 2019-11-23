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
    preRules,
    postRules,
  } = ctx.accountMgr;
  const curRuntimeId = ctx.get('x-whistle-runtime-id');
  const isSelf = curRuntimeId === ctx.runtimeId;
  const baseUrl = !isSelf && getBaseUrl();
  if (baseUrl) {
    if (curBaseUrl !== baseUrl || curPatterns !== patterns) {
      curBaseUrl = baseUrl;
      curPatterns = patterns;
      const ignorePatterns = [`ignore://${curRuntimeId ? 'internal-' : ''}proxy`];
      const injectRule = `internal-proxy://${baseUrl} ${INJECT_RULE} enable://clientId|mutilClient|strictHtml`;
      const normalRule = `internal-proxy://${baseUrl} enable://clientId|mutilClient`;
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
      const domain = baseUrl.split(':', 1)[0];
      if (ignorePatterns.length > 1) {
        curRules.unshift(ignorePatterns.join(' '));
      }
      curRules.unshift(`${domain} internal-proxy://${baseUrl} ignore://rule|html enable://hide|proxyHost|clientId|mutilClient`);
      curRules.push('\n', INJECT_HTML);
      curRules = preRules.concat(curRules).concat(postRules).join('\n');
    }
    ctx.body = curRules;
  } else {
    ctx.body = '';
  }
};
