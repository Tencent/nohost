const { isLocalAddress } = require('../../../lib/util/address');

describe('util address', () => {
  test('should isLocalAddress be true with empty', () => {
    expect(isLocalAddress()).toBeTruthy();
  });

  test('should isLocalAddress be true with params length < 7', () => {
    expect(isLocalAddress('127')).toBeTruthy();
  });

  test('should isLocalAddress be true with params 0:0:0:0:0:0:0:1', () => {
    expect(isLocalAddress('0:0:0:0:0:0:0:1')).toBeTruthy();
  });

  test('should isLocalAddress be true while params has []', () => {
    expect(isLocalAddress('[127.0.0.1]')).toBeTruthy();
  });

  test('should isLocalAddress be false while params has single [', () => {
    expect(isLocalAddress('[127.0.0.1')).toBeFalsy();
  });
});
