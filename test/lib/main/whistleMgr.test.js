const path = require('path');

const filePath = path.join(process.cwd(), 'test');
process.env.WHISTLE_PATH = filePath;

const { fork, restart } = require('../../../lib/main/whistleMgr');

describe('lib main whistleMgr', () => {
  const server = fork();
  test('should fork return Promise', done => {
    server.then(port => {
      expect(port).toBeGreaterThanOrEqual(3000);
      done();
    });
  });

  test('should _eventsCount be 0 after restart', done => {
    server.then(() => {
      restart();
      expect(server.whistleProcess._eventsCount).toBe(0);
      done();
    });
  });
});
