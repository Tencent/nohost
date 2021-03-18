const url = require('url');
const { createServer } = require('http');
const { httpRequire, setPath } = require('../../utils');

setPath();
const {
  passToWhistle,
  passToService,
} = require('../../../lib/main/util');

jest.mock('@nohost/connect', () => {
  return {
    request: () => {
      return {
        statusCode: 200,
        pipe: () => true,
      };
    },
    getRawHeaders: () => true,
    tunnel: () => true,
    upgrade: () => true,
  };
});


const cb = jest.fn();

// debug mode
const options = {
  port: 10011,
  debugMode: 'product',
};

// passToService 使用
let ctx = null;

const testUrl = ['/head', '/upgrade', '/tunnel', '/error'];
const server = createServer(options, async (req, res) => {
  const { pathname } = url.parse(req.url);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  if (pathname === '/tunnel') {
    res.writeHead = '';
  } else if (pathname === '/upgrade') {
    res.writeHead = '';
    req.isUpgrade = false;
  } else if (pathname === '/service') {
    ctx = { req, res };
  }

  await passToWhistle(req, res);
  if (testUrl.includes(pathname)) {
    res.write('Hello World!');
    res.end();
  }
});

server.listen(options.port, '127.0.0.1', cb);

describe('main util', () => {
  test('passToWhistle tunnel test', done => {
    httpRequire(`http://127.0.0.1:${options.port}/tunnel`).then(res => {
      expect(res).toBe('Hello World!');
      done();
    });
  });

  test('passToWhistle upgrade test', done => {
    httpRequire(`http://127.0.0.1:${options.port}/upgrade`).then(res => {
      expect(res).toBe('Hello World!');
      done();
    });
  });

  test('passToService upgrade test', async() => {
    httpRequire(`http://127.0.0.1:${options.port}/service`).then(async() => {
      await passToService(ctx);
      expect(ctx.body).toBe('');
    });
  });
});
