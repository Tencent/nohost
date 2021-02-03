const path = require('path');
const kill = require('kill-port');

const filePath = path.join(process.cwd(), 'test');
process.env.WHISTLE_PATH = filePath;

const createServer = require('../../lib/index');

const options = {
  username: '',
  password: '',
  port: '3002',
};
// kill(8080, 'tcp');

describe('lib index', () => {
  test('', () => {
    createServer(options);
    kill(30017, 'tcp');
  });
});
