const { setPath } = require('../../../utils');

setPath();
const removeCert = require('../../../../lib/main/cgi/removeCert');
const certsMgr = require('../../../../lib/main/certsMgr');
const whistleMgr = require('../../../../lib/main/whistleMgr');

const ctx = {
  request: {
    body: {},
  },
  body: {},
  certsMgr,
};

ctx.certsMgr = certsMgr;
ctx.whistleMgr = whistleMgr;

describe('main cgi getVersion', () => {
  test('filename is string', async () => {
    ctx.request.body.filename = 'aaa';

    await removeCert(ctx);
    expect(ctx.body).toMatchObject({ ec: 0 });
  });

  test('filename is array', async () => {
    ctx.request.body.filename = ['aaa', 'bbb'];

    await removeCert(ctx);
    expect(ctx.body).toMatchObject({ ec: 0 });
  });
});
