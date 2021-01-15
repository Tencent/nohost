const path = require('path');

const filePath = path.join(process.cwd(), 'test');
process.env.WHISTLE_PATH = filePath;

const { checkDomain, isUIRequest } = require('../../../lib/main/storage');

const req = {
  headers: {
    host: 'https://nohost.com',
  },
  url: 'https://nohost.com',
};

describe('lib main strage test', () => {
  test('should checkDomain be false while domain is number', () => {
    expect(checkDomain(123)).toBeFalsy();
  });

  test('should checkDomain be true while domain is correct', () => {
    expect(checkDomain('abc.com')).toBeTruthy();
  });

  test('should vsersion be package version', () => {
    expect(isUIRequest(req)).toBeUndefined();
  });

  test('should isUIRequest result be undefined', () => {
    req.headers.host = '';
    req.url = '';
    expect(isUIRequest(req)).toBeUndefined();
  });

  test('should isUIRequest result be true', () => {
    req.headers.host = '';
    req.url = 'https://qq/.nohost-inner-path./com';
    expect(isUIRequest(req)).toBeTruthy();
  });

  test('should isUIRequest result be true', () => {
    req.headers['x-whistle-nohost-ui'] = 1;
    req.url = 'https://qq/.nohost-inner-path./com';
    expect(isUIRequest(req)).toBeTruthy();
  });
});
