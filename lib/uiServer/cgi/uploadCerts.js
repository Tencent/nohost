
module.exports = async (ctx) => {
  const { body } = ctx.request;
  if (Array.isArray(body)) {
    await Promise.all(body.map(({ name, content }) => {
      return ctx.certsMgr.write(name, content);
    }));
    ctx.whistleMgr.restart();
  }
  ctx.body = { ec: 0 };
};
