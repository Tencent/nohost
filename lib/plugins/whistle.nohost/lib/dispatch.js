
const whistleMgr = require('./whistleMgr');
const {
  WHISTLE_ENV_HEADER,
  WHISTLE_RULE_VALUE,
  isWorker,
} = require('./util');

const SPACE_RE = /\s/;
const NOHOST_RULE = 'x-whistle-nohost-rule';
const NOHOST_VALUE = 'x-whistle-nohost-value';

module.exports = async (ctx, next) => {
  const name = ctx.get(WHISTLE_ENV_HEADER);
  if (!isWorker(name)) {
    await next();
    return;
  }
  const rules = ctx.get(NOHOST_RULE);
  const port = await whistleMgr.fork(name);
  const proxyUrl = `internal-proxy://127.0.0.1:${port}`;
  let envHeader;
  if (rules) {
    envHeader = { [WHISTLE_RULE_VALUE]: SPACE_RE.test(rules) ? encodeURIComponent(rules) : rules };
    const values = ctx.get(NOHOST_VALUE);
    if (values) {
      envHeader['x-whistle-key-value'] = values;
    }
    envHeader = `${JSON.stringify(envHeader)}`;
  }
  const delRules = `delete://req.headers.${NOHOST_RULE}|req.headers.${NOHOST_VALUE} ignore://htmlAppend`;
  ctx.body = `* ${proxyUrl} ${delRules} ${envHeader ? `reqHeaders://${envHeader}` : ''}`;
};
