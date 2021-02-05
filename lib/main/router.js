const bodyParser = require('koa-bodyparser');
const { passToWhistle, passToService } = require('./util');
const login = require('./cgi/login');
const restart = require('./cgi/restart');
const getSettings = require('./cgi/getSettings');
const setAdmin = require('./cgi/setAdmin');
const setDomain = require('./cgi/setDomain');
const uploadCerts = require('./cgi/uploadCerts');
const removeCert = require('./cgi/removeCert');
const getVersion = require('./cgi/getVersion');
const status = require('./cgi/status');

const passDirect = async (ctx) => {
  await passToWhistle(ctx);
};
const getPassHandler = (cgiPath) => {
  return async (ctx) => {
    const { req } = ctx;
    req.url = req.url.replace(cgiPath, `/plugin.nohost${cgiPath}`);
    await passToWhistle(ctx);
  };
};

module.exports = (router) => {
  router.get('/cgi-bin/get-custom-certs-info', passDirect);
  router.all('/cgi-bin/sessions/export', passToService);
  router.all('/cgi-bin/sessions/import', passToService);
  router.get('/status', status);
  router.all('/cgi-bin/**', getPassHandler('/cgi-bin/'));
  router.all('/network/**', getPassHandler('/network/'));
  router.all(/^\/account\/\$(\d+)\//, async (ctx) => {
    const index = ctx.params[0];
    ctx.url = ctx.url.replace(`/account/$${index}/`, '/');
    await passToWhistle(ctx, null, index);
  });
  router.all('/account/**', getPassHandler('/account/'));
  router.all('/user/:name', (ctx) => {
    const name = ctx.params.name.replace(/\..*$/, '');
    ctx.redirect(`${ctx.path.slice(-1) === '/' ? '../' : ''}../account/${name}/`);
  });
  router.all('/open-api/**', getPassHandler('/open-api/'));
  router.all('/follow', getPassHandler('/follow'));
  router.all('/unfollow', getPassHandler('/unfollow'));
  router.all('/redirect', getPassHandler('/redirect'));

  router.all('/p/:name/**', async (ctx) => {
    let { name } = ctx.params;
    const segPath = `/p/${name}`;
    name = name.indexOf('.') === -1 ? `/plugin.${name}` : name;
    ctx.req.url = ctx.req.url.replace(segPath, name);
    await passToWhistle(ctx);
  });
  router.all('/p/:name', (ctx) => {
    ctx.redirect(ctx.req.url.replace(/(\?|$)/, '/$1'));
  });
  router.all('/whistle/**', passDirect);
  router.all('/whistle.**', passDirect);
  router.all('/plugin.**', passDirect);
  router.get('/get-version', getVersion);
  router.all('/admin.html', login);
  router.all('/main/cgi-bin/**', login, bodyParser({ formLimit: '1mb' }));
  router.post('/main/cgi-bin/restart', restart);
  router.get('/main/cgi-bin/get-settings', getSettings);
  router.post('/main/cgi-bin/set-admin', setAdmin);
  router.post('/main/cgi-bin/set-domain', setDomain);
  router.post('/main/cgi-bin/upload-certs', uploadCerts);
  router.post('/main/cgi-bin/remove-cert', removeCert);
};
