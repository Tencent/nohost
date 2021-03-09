const { setPath } = require('../../../utils');

setPath();

const uploadCerts = require('../../../../lib/main/cgi/uploadCerts');
const whistleMgr = require('../../../../lib/main/whistleMgr');
const certsMgr = require('../../../../lib/main/certsMgr');

const ctx = {
  request: {
    body: {
      certs: ['aaa', 'bbb'],
    },
  },
  whistleMgr,
  certsMgr,
};

const restart = jest.fn();
ctx.whistleMgr.restart = restart;
ctx.certsMgr.write = name => name;

describe('main cgi uploadCerts', () => {
  test('restart should be called', async() => {
    await uploadCerts(ctx);
    expect(restart).toBeCalled();
  });

  test('ec should be 0', async() => {
    ctx.request.body = {
      'a,': ['', ''],
    };
    await uploadCerts(ctx);
    expect(ctx.body.ec).toBe(0);
  });

  test('ec should be 0', async() => {
    ctx.request.body = '';
    await uploadCerts(ctx);
    expect(ctx.body.ec).toBe(0);
  });

  test('ec should be 0 while certs is not Array', async() => {
    ctx.request.body = {
      certs: 123,
    };
    await uploadCerts(ctx);
    expect(ctx.body.ec).toBe(0);
  });

  test('ec should be 0 while key is empty', async() => {
    ctx.request.body = {
      certs: ['', '213'],
    };
    await uploadCerts(ctx);
    expect(ctx.body.ec).toBe(0);
  });

  test('ec should be 0 while key is > max legth', async() => {
    ctx.request.body = {
      certs: [''.padEnd(1024 * 66 + 2, 0), '213'],
    };
    await uploadCerts(ctx);
    expect(ctx.body.ec).toBe(0);
  });
});
