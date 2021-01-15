const initConfig = require('../../lib/config');

initConfig({ mode: 'product' });

describe('lib config test', () => {
  const options = require('../../lib/config'); // eslint-disable-line
  test('should option.mode a be equal product', () => {
    expect(options.mode).toBe('product');
  });
});
