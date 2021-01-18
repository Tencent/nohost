const path = require('path');

const filePath = path.join(process.cwd(), 'test');
process.env.WHISTLE_PATH = filePath;

// process.on('unhandledRejection', function (err) {

// });

const {
  removeIPV6Prefix,
  getClientIp,
  destroy,
  onClose,
} = require('../../../lib/main/util');

describe('main util', () => {
  test('should removeIPV6Prefix return empty', () => {
    expect(removeIPV6Prefix(123)).toBe('');
  });

  test('should removeIPV6Prefix return empty', () => {
    const req = {
      headers: {
        XFF: '::ffff:192.1.56.10',
      },
      socket: {
        remoteAddress: '192.168.1.1',
      },
    };
    expect(getClientIp(req)).toEqual('192.168.1.1');
  });

  test('should destory be called', () => {
    const destroyFn = jest.fn();
    const req = {
      destroy: destroyFn,
    };

    destroy(req);
    expect(destroyFn).toBeCalled();
  });

  test('should abort be called', () => {
    const abortFn = jest.fn();
    const req = {
      abort: abortFn,
    };

    destroy(req);
    expect(abortFn).toBeCalled();
  });

  test('should onClose return undefined', () => {
    const req = {
      _hasError: false,
      on: (type, cb) => cb(),
      once: (type, cb) => cb(),
    };
    const res = jest.fn();
    expect(onClose(req, res)).toBe(undefined);
  });

  // test('should getWhistleData return promise ',()=>{
  //   const req = {
  //     headers:{
  //       'content-length': 10,
  //     },
  //     _hasError:false,
  //     dispatch: name => dispatchList[name](),
  //     dispatchList: [],
  //     on: function (type, cb) {
  //       this.dispatchList[type] = cb()
  //     },
  //     once: (type,cb) => cb(),
  //   }
  //   const res = jest.fn()
  //   expect(getWhistleData(req)).toBeInstanceOf(Promise)
  // })
});
