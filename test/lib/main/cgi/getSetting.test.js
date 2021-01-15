const path = require('path');
const filePath = path.join(process.cwd(), 'test');
process.env.WHISTLE_PATH = filePath;

const getSetting = require('../../../../lib/main/cgi/getSettings');

const storage = {
  getAdmin: ()=> {
    return {username: 'admin'}
  },
  getDomain: () => 'localhost',
};

const ctx = {
  req: {},
  storage,
};

describe('main cgi getSetting', () => {
test('should ctx.body.username be admin',() => {
  getSetting(ctx);
  expect(ctx.body.admin.username).toEqual('admin');
 });
});