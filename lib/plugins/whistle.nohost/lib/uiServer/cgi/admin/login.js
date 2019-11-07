const { checkLogin } = require('../../../../../../util/login');

module.exports = async (ctx, next) => {
  const { username, password } = ctx.admin;
  const accept = checkLogin(ctx, {
    username,
    password,
    nameKey: 'nohost_admin_name',
    authKey: 'nohost_admin_key',
  });
  if (accept) {
    await next();
  }
};
