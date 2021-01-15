const createServe = require('../../../lib/service/index');

describe('lib servie index', () => {
  test('createServe is return a promise', () => {
      const serve = createServe(0);
      expect(serve).toBeInstanceOf(Promise);
  });
});
