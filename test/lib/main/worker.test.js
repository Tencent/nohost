const { kill, fork } = require('../../../lib/main/worker');

describe('test main worker', () => {
  test('fork, should port return > 0 ', done => {
    fork(0).then(port => {
      expect(port).toBeGreaterThanOrEqual(0);
      done();
    });
  });

  test('fork, kill port should return undefined', done => {
    expect(kill(0)).toBeUndefined();
    done();
  });
});
