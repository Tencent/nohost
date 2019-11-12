module.exports = (ctx) => {
  const { username, password } = ctx.request.query;
  ctx.admin = { username, password };
  ctx.body = { ec: 0 };
};
