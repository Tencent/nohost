const MAX_SIZE = 1024 * 12;

module.exports = async (ctx) => {
  const { body } = ctx.request;
  if (body) {
    const pendingList = [];
    Object.keys(body).forEach((name) => {
      if (/[^\w*.-]/.test(name)) {
        return;
      }
      const certs = body[name];
      if (Array.isArray(certs)) {
        const [key, crt] = certs;
        if (!key || !crt || typeof key !== 'string' || typeof crt !== 'string') {
          return;
        }
        if (Buffer.byteLength(key) > MAX_SIZE || Buffer.byteLength(crt) > MAX_SIZE) {
          return;
        }
        pendingList.push(ctx.certsMgr.write(`${name}.key`, key));
        pendingList.push(ctx.certsMgr.write(`${name}.crt`, crt));
      }
    });
    await pendingList;
    ctx.whistleMgr.restart();
  }
  ctx.body = { ec: 0 };
};
