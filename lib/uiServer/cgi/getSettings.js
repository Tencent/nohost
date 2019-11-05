
module.exports = (ctx) => {
  const { storage } = ctx;
  ctx.body = {
    ec: 0,
    admin: storage.getAdmin(),
    domain: storage.getDomainList(),
    token: storage.getToken(),
    whiteList: storage.getWhiteList(),
  };
};
