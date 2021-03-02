const { setPath } = require('../../../utils');

setPath();
const setDomain = require('../../../../lib/main/cgi/setDomain');
const storage = require('../../../../lib/main/storage');
const whistleMgr = require('../../../../lib/main/whistleMgr');

const ctx = {
  request: {
    body: {
      domain: 'abc.com',
    },
  },
  whistleMgr,
  storage,
};

describe('mian cig setDomain', () => {
  test('should restartFn be called while domian not equal current domain', () => {
    const restartFn = jest.fn();
    whistleMgr.restart = restartFn;


    storage.setDomain('localhost');
    setDomain(ctx);
    expect(restartFn).toHaveBeenCalled();
  });

  test('should restartFn not be called while domian equal current domain', () => {
    const restartFn = jest.fn();
    whistleMgr.restart = restartFn;

    storage.setDomain('abc.com');
    setDomain(ctx);
    expect(restartFn).toHaveBeenCalledTimes(0);
  });

  test('should restartFn not be called while domian is not correct', () => {
    const restartFn = jest.fn();
    whistleMgr.restart = restartFn;

    ctx.request.body.domain = 1231233;
    setDomain(ctx);
    expect(restartFn).toHaveBeenCalledTimes(0);
  });
});
