const { getClientId } = require('../../util');

module.exports = (ctx) => {
  const { url, name, env } = ctx.request.query;
  const account = ctx.accountMgr.getAccount(name);
  if (account) {
    ctx.envMgr.setEnv(getClientId(ctx), name, env);
  }
  ctx.redirect(url || './');
};
