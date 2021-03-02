const { kill, fork } = require('../../../lib/main/worker');

describe('test main worker', () => {
  test('fork, should return ', done => {
    fork(0).then(port => {
      expect(port).toBeGreaterThanOrEqual(0);
      done();
    });
  });

  test('fork, should return ', done => {
    kill(0);
    done();
  });
});
