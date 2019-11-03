const { COOKIE_NAME, ENV_MAX_AGE, decodeURIComponentSafe, getClientId } = require('../../util');

module.exports = (ctx) => {
  const { name, envId, redirect } = ctx.request.query;
  const envName = decodeURIComponentSafe(envId);
  const env = ctx.envMgr.setEnv(getClientId(ctx), name, envName);
  let value = '';
  if (env) {
    value = encodeURIComponent(`${name}/${env.envName}`);
  }
  ctx.cookies.set(COOKIE_NAME, value, {
    path: '/',
    expires: new Date(Date.now() + (ENV_MAX_AGE * 1000)),
  });
  if (redirect && typeof redirect === 'string') {
    ctx.redirect(redirect);
  } else {
    ctx.body = { ec: 0 };
  }
};
