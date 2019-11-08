
module.exports = (ctx) => {
  const { storage } = ctx;
  ctx.body = {
    ec: 0,
    admin: {
      username: storage.getAdmin().username,
    },
    enableGuest: storage.isEnableGuest(),
    guest: storage.getGuest(),
    domain: storage.getDomain(),
    token: storage.getToken(),
    whiteList: storage.getWhiteList(),
  };
};
