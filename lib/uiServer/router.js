
module.exports = (router) => {
  router.all('/cgi-bin/*', (ctx) => {
    console.log(ctx.path);
  });
};
