const getVersion = require('../../../../lib/main/cgi/getVersion');

const storage = {
  latestVersion: '1.0.0',
};

const ctx = {
  req: {},
  storage,
};

describe('main cgi getVersion', () => {
  getVersion(ctx);
  test('should ctx.storage.latestVersion be 1.0.0', () => {
    expect(ctx.storage.latestVersion).toEqual('1.0.0');
  });
});