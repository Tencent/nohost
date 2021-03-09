const Koa = require('koa');
const router = require('koa-router')();
const serve = require('koa-static');
const path = require('path');
const { createServer } = require('http');
const { httpRequire, setPath } = require('../../utils');

setPath();
const setupRouter = require('../../../lib/main/router');


const MAX_AGE = 1000 * 60 * 5;
const app = new Koa();

setupRouter(router);
app.use(router.routes());
app.use(router.allowedMethods());
app.use(serve(path.join(__dirname, '../../../../../public/'), { maxage: MAX_AGE }));

const cb = jest.fn();

// debug mode
const options = {
  port: 10010,
  debugMode: 'product',
};

const server = createServer(options, (req, res) => {
  app.callback()(req, res);
});
server.listen(options.port, '127.0.0.1', cb);

const REQUEST_URL = `http://127.0.0.1:${options.port}`;
describe('lib main router', () => {
  test('/user/wonder redirect to /account/wonder', done => {
    httpRequire(`${REQUEST_URL}/user/wonder`).then((res) => {
      expect(res).toContain('/account/wonder');
      done();
    });
  });

  test('/p/plugin.share/ab', done => {
    httpRequire(`${REQUEST_URL}/p/plugin.share/ab`).then((res) => {
      expect(res).not.toBeNull();
      done();
    });
  });

  test('/p/wonder', done => {
    httpRequire(`${REQUEST_URL}/p/wonder`).then((res) => {
      expect(res).toContain('<a href="/p/wonder/">/p/wonder/</a>');
      done();
    });
  });

  test('/account/$123/', done => {
    httpRequire(`${REQUEST_URL}/account/$123/`).then((res) => {
      expect(res).toContain('Not Found');
      done();
    });
  });
});
