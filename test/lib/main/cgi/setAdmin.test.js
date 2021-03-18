const { setPath } = require('../../../utils');

setPath();

const setAdmin = require('../../../../lib/main/cgi/setAdmin');
const storage = require('../../../../lib/main/storage');
const whistleMgr = require('../../../../lib/main/whistleMgr');

const userInfo = {
  username: 'admin',
  password: '69c5fcebaa65b560eaf06c3fbeb481ae44b8d618',
};

const ctx = {
  request: {
    body: userInfo,
  },
  storage,
};

ctx.whistleMgr = whistleMgr;

describe('main cgi setAdmin', () => {
  test('admin name is not equal old admin name', async () => {
    await setAdmin(ctx);
    expect(ctx.body).toMatchObject({ ec: 0 });
  });

  test('admin name is equal old admin name', async () => {
    await setAdmin(ctx);
    expect(ctx.body).toMatchObject({ ec: 0 });
  });
});
