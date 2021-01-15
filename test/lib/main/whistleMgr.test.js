const path = require('path');

const filePath = path.join(process.cwd(), 'test');
process.env.WHISTLE_PATH = filePath;

const { fork, restart } = require('../../../lib/main/whistleMgr');

describe('lib main whistleMgr', () => {
  test('should fork return Promise', () => {
    const server = fork();
    expect(server).toBeInstanceOf(Promise);
  });
});
