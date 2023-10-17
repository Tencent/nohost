const Koa = require('koa');
const accountMgr = require('./accountMgr');
const envMgr = require('./envMgr');
const whistleMgr = require('./whistleMgr');
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
  app.silent = true;
  app.use(async (ctx) => {
    let { account, env } = envMgr.getEnvByHeader(ctx);
    if (!account && (!ctx.get(WHISTLE_ENV_HEADER) || ctx.get(WHISTLE_ENV_HEADER) === 'null')) {
      env = envMgr.getEnv(ctx);
      account = env && accountMgr.getAccount(env.name);
    }
    const hostname = (ctx.get('host') || '').split(':')[0];
    const noInject = getRuleValue(ctx) === 'none' || ctx.get('x-whistle-nohost-hide');
    const injectRule = `htmlPrepend://{whistle.nohost/${noInject ? 'none' : 'inject'}.html} enable://safeHtml`;

    if (!account) {
      ctx.body = {
        rules: `* resCookies://{whistleEnvCookie} ${injectRule}`,
        values: getCookie('', -ENV_MAX_AGE, hostname),
      };
      return;
    }
    const name = account && account.name;
    let envHeader = '';
    let envKey = `${name}/`;
    const { envName } = env;
    const reqHeaders = {};

    if (envName) {
      envKey += envName;
      let { rules, headers } = accountMgr.getRules(account.name, envName);
      if (headers) {
        headers = JSON.stringify(headers);
        rules += `\n* reqHeaders://(${headers})`;
      }
      if (rules) {
        reqHeaders[WHISTLE_RULE_VALUE] = encodeURIComponent(rules);
      }
    }
    reqHeaders[WHISTLE_ENV_HEADER] = encodeURIComponent(envKey);
    const {
      port,
      remoteAddrHead,
      remotePortHead,
    } = await whistleMgr.fork(account);
    const {
      remoteAddress,
      remotePort,
    } = ctx.req.originalReq;
    reqHeaders[remoteAddrHead] = remoteAddress;
    reqHeaders[remotePortHead] = remotePort;
    envHeader = `reqHeaders://(${JSON.stringify(reqHeaders)})`;
    const proxyUrl = `internal-proxy://127.0.0.1:${port}`;
    const cookie = getCookie(envKey, ENV_MAX_AGE, hostname);
    ctx.body = {
      rules: `* ${proxyUrl} ${envHeader} ${injectRule} ${cookie ? 'resCookies://{whistleEnvCookie}' : ''}`,
      values: cookie,
    };
  });
  server.on('request', app.callback());
};
