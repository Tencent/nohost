const { COOKIE_NAME, ENV_MAX_AGE, decodeURIComponentSafe, getClientId, getDomain } = require('../../util');

module.exports = (ctx) => {
  const { name, envId, redirect } = ctx.request.query;
  const hostname = (ctx.get('host') || '').split(':')[0];
  const envName = decodeURIComponentSafe(envId);
  const env = ctx.envMgr.setEnv(getClientId(ctx), name, envName);
  let value = '';
  if (env) {
    value = encodeURIComponent(`${name}/${env.envName}`);
  }
  ctx.cookies.set(COOKIE_NAME, value, {
    path: '/',
    expires: new Date(Date.now() + (ENV_MAX_AGE * 1000)),
    domain: getDomain(hostname),
  });
  if (redirect && typeof redirect === 'string') {
    ctx.redirect(redirect);
  } else {
    ctx.body = { ec: 0 };
  }
};
