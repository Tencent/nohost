
const Koa = require('koa');
const router = require('koa-router')();
const serve = require('koa-static');
const path = require('path');
const { createServer } = require('http');
const { httpPost } = require('../../../utils');
const status = require('../../../../lib/main/cgi/status');

const setupRouter = (r) => {
  r.get('/status', status);
};


const MAX_AGE = 1000 * 60 * 5;
const app = new Koa();

setupRouter(router);
app.use(router.routes());
app.use(router.allowedMethods());
app.use(serve(path.join(__dirname, '../../../../../public/'), { maxage: MAX_AGE }));

const cb = jest.fn();

// debug mode
const options = {
  port: 10012,
  debugMode: 'product',
};


const server = createServer(options, (req, res) => {
  app.callback()(req, res);
});

server.listen(options.port, '127.0.0.1', cb);
const servers = '111.222.333.444:55555/67,888.999.999.999:00000/123,888.999.999.999:00000/123';

describe('test status', () => {
  const params = {
    host: '127.0.0.1',
    port: options.port,
    method: 'GET',
    path: '/status?space=123&group=456',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-nohost-servers': Buffer.from(servers).toString('base64'),
    },
  };

  test('get status', done => {
    httpPost(params).then((res) => {
      expect(res).toContain('workerNum');
      done();
    });
  });

  test('get status with empty x-nohost-servers', done => {
    params.headers['x-nohost-servers'] = '';
    httpPost(params).then((res) => {
      expect(res).toContain('workerNum');
      done();
    });
  });

  test('get status with wrong x-nohost-servers', done => {
    params.headers['x-nohost-servers'] = Buffer.from('123').toString('base64');
    httpPost(params).then((res) => {
      expect(res).toContain('workerNum');
      done();
    });
  });

  test('get status with empty query', done => {
    params.path = '/status';
    httpPost(params).then((res) => {
      expect(res).toContain('workerNum');
      done();
    });
  });
});
