
const whistleMgr = require('./whistleMgr');
const {
  WHISTLE_ENV_HEADER,
  WHISTLE_RULE_VALUE,
  NOHOST_RULE_VALUE,
  isWorker,
} = require('./util');

module.exports = async (ctx, next) => {
  const name = ctx.get(WHISTLE_ENV_HEADER);
  if (!isWorker(name)) {
    await next();
    return;
  }
  const rules = ctx.get(NOHOST_RULE_VALUE);
  const envHeader = rules ? `${JSON.stringify({ [WHISTLE_RULE_VALUE]: rules })}` : '';
  const port = await whistleMgr.fork(name);
  const proxyUrl = `internal-proxy://127.0.0.1:${port}`;
  ctx.body = `/./ ${proxyUrl} delete://req.headers.${NOHOST_RULE_VALUE}${envHeader && ` reqHeaders://${envHeader}`}`;
};
