
const whistleMgr = require('./whistleMgr');
const {
  WHISTLE_ENV_HEADER,
  WHISTLE_RULE_VALUE,
  decodeURIComponentSafe,
  parseJSON,
  isWorker,
} = require('./util');

const NOHOST_RULE = 'x-whistle-nohost-rule';
const NOHOST_VALUE = 'x-whistle-nohost-value';

const getBackQuoteCount = (value) => {
  let list = value.match(/^\s*```+\s*$/mg);
  list = list && list.map(item => item.trim().length);
  if (list && list.includes(3)) {
    let count = 4;
    for (let i = 0, len = list.length; i < len; i++) {
      if (!list.includes(count)) {
        return count;
      }
      ++count;
    }
  }
  return 3;
};

const getInlineValue = (key, value) => {
  if (value == null) {
    return '';
  }
  if (typeof value !== 'string') {
    try {
      value = JSON.stringify(value, null, '  ');
    } catch (e) {
      value = `${value}`;
    }
  }
  const sep = '`'.repeat(getBackQuoteCount(value));
  return `\n${sep} ${key}\n${value}\n${sep}\n`;
};

const getValues = (ctx) => {
  const values = decodeURIComponentSafe(ctx.get(NOHOST_VALUE));
  return parseJSON(values);
};

module.exports = async (ctx, next) => {
  const name = ctx.get(WHISTLE_ENV_HEADER);
  if (!isWorker(name)) {
    await next();
    return;
  }
  let rules = ctx.get(NOHOST_RULE);
  const port = await whistleMgr.fork(name);
  const proxyUrl = `internal-proxy://127.0.0.1:${port}`;
  let envHeader = '';
  if (rules) {
    let values = getValues(ctx);
    if (values) {
      values = Object.keys(values)
        .map((key) => {
          return getInlineValue(key, values[key]);
        }).join('');
      rules = `${values}\n${decodeURIComponentSafe(rules)}`;
      rules = encodeURIComponent(rules);
    }
    envHeader = `${JSON.stringify({ [WHISTLE_RULE_VALUE]: rules })}`;
  }
  const delRules = `delete://req.headers.${NOHOST_RULE}|req.headers.${NOHOST_VALUE}`;
  ctx.body = `/./ ${proxyUrl} ${delRules} ${envHeader && `reqHeaders://${envHeader}`}`;
};
