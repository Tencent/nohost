const { setPath } = require('../../../utils');

setPath();
const getSetting = require('../../../../lib/main/cgi/getSettings');

const storage = {
  getAdmin: () => {
    return { username: 'admin' };
  },
  getDomain: () => 'localhost',
};

const ctx = {
  req: {},
  storage,
};

describe('main cgi getSetting', () => {
  test('should ctx.body.username be admin', () => {
    getSetting(ctx);
    expect(ctx.body.admin.username).toEqual('admin');
  });
});
