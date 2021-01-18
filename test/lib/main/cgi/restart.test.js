const path = require('path');

const filePath = path.join(process.cwd(), 'test');
process.env.WHISTLE_PATH = filePath;

const restart = require('../../../../lib/main/cgi/restart');
const whistleMgr = require('../../../../lib/main/whistleMgr');

const ctx = {
  body: {},
};

ctx.whistleMgr = whistleMgr;

describe('main cgi restart', () => {
  test('ctx.body is {ec:0} after restart', () => {
    restart(ctx);
    expect(ctx.body).toMatchObject({ ec: 0 });
  });
});
