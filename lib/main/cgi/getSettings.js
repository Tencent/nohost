
module.exports = async (ctx) => {
  const { storage } = ctx;
  ctx.body = {
    ec: 0,
    admin: {
      username: storage.getAdmin().username,
    },
    domain: storage.getDomain(),
  };
};
