const Koa = require('koa');
const accountMgr = require('./accountMgr');
const envMgr = require('./envMgr');
const whistleMgr = require('./whistleMgr');
const dispatch = require('./dispatch');
const {
  COOKIE_NAME,
  ENV_MAX_AGE,
  WHISTLE_ENV_HEADER,
  WHISTLE_RULE_VALUE,
  getRuleValue,
  getDomain,
} = require('./util');

const getCookie = (value, maxAge, hostname) => {
  return {
    whistleEnvCookie: {
      [COOKIE_NAME]: {
        value,
        maxAge,
        domain: getDomain(hostname),
        path: '/',
      },
    },
  };
};

module.exports = (server) => {
  const app = new Koa();
  app.proxy = true;
  app.use(dispatch);
  app.use(async (ctx) => {
    let { account, env } = envMgr.getEnvByHeader(ctx);
    if (!account && !ctx.get(WHISTLE_ENV_HEADER)) {
      env = envMgr.getEnv(ctx);
      account = env && accountMgr.getAccount(env.name);
    }
    const hostname = (ctx.get('host') || '').split(':')[0];
    const filter = (getRuleValue(ctx) === 'none' || ctx.get('x-whistle-nohost-hide')) ? 'filter://htmlAppend' : '';
    if (!account) {
      ctx.body = {
        rules: `/./ resCookies://{whistleEnvCookie} ${filter}`,
        values: getCookie('', -ENV_MAX_AGE, hostname),
      };
      return;
    }
    const name = account && account.name;
    let envHeader = '';
    let envKey = `${name}/`;

    if (env) {
      const { envName } = env;
      const reqHeaders = {};
      if (envName) {
        envKey += envName;
        let { rules, headers } = accountMgr.getRules(account.name, envName);
        if (headers) {
          headers = JSON.stringify(headers);
          rules += `\n/./ reqHeaders://(${headers})`;
        }
        if (rules) {
          reqHeaders[WHISTLE_RULE_VALUE] = encodeURIComponent(rules);
        }
      }
      reqHeaders[WHISTLE_ENV_HEADER] = encodeURIComponent(envKey);
      envHeader = `reqHeaders://(${JSON.stringify(reqHeaders)})`;
    }
    const port = await whistleMgr.fork(account);
    const proxyUrl = `internal-proxy://127.0.0.1:${port}`;
    const cookie = getCookie(envKey, ENV_MAX_AGE, hostname);
    ctx.body = {
      rules: `/./ ${proxyUrl} ${envHeader} ${filter} ${cookie ? 'resCookies://{whistleEnvCookie}' : ''}`,
      values: cookie,
    };
  });
  server.on('request', app.callback());
};
