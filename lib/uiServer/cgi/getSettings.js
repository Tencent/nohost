
module.exports = (ctx) => {
  const { storage } = ctx;
  ctx.body = {
    ec: 0,
    admin: storage.getAdmin(),
    domain: storage.getDomain(),
    token: storage.getToken(),
    whiteList: storage.getWhiteList(),
  };
};
