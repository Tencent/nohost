const Koa = require('koa');
const accountMgr = require('./accountMgr');
const envMgr = require('./envMgr');
const whistleMgr = require('./whistleMgr');
const {
  WHISTLE_ENV_HEADER,
  WHISTLE_RULE_VALUE,
} = require('./util');

const SEP_RE = /\s+/;
const CRLF_RE = /\s*[\r\n]+\s*/;
const CAPTURE_RE = /^(?:[^\r\n]*\s)?enable:\/\/(?:capture|https|intercept)(?:\s|$)/m;

module.exports = (server) => {
  const app = new Koa();
  app.proxy = true;
  app.silent = true;
  app.use(async (ctx) => {
    let { account, env } = envMgr.getEnvByHeader(ctx);
    if (!account) {
      env = envMgr.getEnvOnly(ctx);
      account = env && accountMgr.getAccount(env.name);
    }
    let proxyUrl = '';
    if (account) {
      const headers = {};
      let envValue = `${account.name}/`;
      if (env) {
        const { envName } = env;
        if (envName) {
          envValue = `${envValue}${envName}`;
          const { rules } = accountMgr.getRules(account.name, envName);
          if (rules) {
            // 设置了拦截https请求，则所有该环境的请求都开启
            if (CAPTURE_RE.test(rules)) {
              const capRules = [];
              rules.trim().split(CRLF_RE).forEach((line) => {
                if (CAPTURE_RE.test(line)) {
                  line.trim().split(SEP_RE).forEach(p => {
                    if (p) {
                      capRules.push(`enable://capture ${p}`);
                    }
                  });
                }
              });
              ctx.body = capRules.join('\n');
              return;
            }
            headers[WHISTLE_RULE_VALUE] = encodeURIComponent(rules);
          }
        }
      }
      headers[WHISTLE_ENV_HEADER] = encodeURIComponent(envValue);
      const envHeader = `reqHeaders://(${JSON.stringify(headers)})`;
      const port = await whistleMgr.fork(account);
      proxyUrl = `internal-proxy://127.0.0.1:${port}`;
      ctx.body = `* ${proxyUrl} ${envHeader}`;
    }
  });
  server.on('request', app.callback());
};
