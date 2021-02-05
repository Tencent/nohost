const path = require('path');

const filePath = path.join(process.cwd(), 'test');
process.env.WHISTLE_PATH = filePath;
const kill = require('kill-port');

const {
  removeIPV6Prefix,
  getClientIp,
  destroy,
  onClose,
  getWhistleData,
  passToWhistle,
  passToService,
} = require('../../../lib/main/util');

jest.mock('http', () => {
  return {
    request: (opts, cb) => {
      const obj = {
        on: (type, callback) => {
          if (type === 'end') {
            callback();
          }
        },
        statusCode: 200,
        setEncoding: () => '',
        pipe: () => '',
      };
      cb(obj);
      return obj;
    },
    createServer: () => {
      return {
        on: () => true,
        listen: (port, host, cb) => cb(),
        removeAllListeners: () => true,
        close: (cb) => cb(),
      };
    },
  };
});
const socket = {
  on: () => true,
  once: () => true,
  removeAllListeners: () => true,
  destroy: () => true,
  write: () => true,
};
jest.mock('net', () => {
  return {
    isIP: () => true,
    connect: (options, cb) => {
      Promise.resolve().then(() => {
        cb();
      });
      return socket;
    },
  };
});

const reqSock = {
  on: type => type,
  once: type => type,
  pipe: () => reqSock,
};

const whistleReq = {
  headers: {
    'content-length': 10,
    'x-forwarded-for': 'localhost:9001',
  },
  _hasError: false,
  dispatch(name) {
    this.dispatchList[name]();
  },
  dispatchList: [],
  on (type, cb) {
    this.dispatchList[type] = cb();
  },
  once: (type, cb) => cb(),
  socket: {
    remoteAddress: 'nohost.com',
  },
  set: () => true,
  pipe: client => {
    client.on('data', () => {});
    client.on('end', () => {
    });
  },
  req: {
    on: () => true,
    once: () => true,
    headers: {
      'x-forwarded-for': 'localhost:9001',
    },
    socket: {
      remoteAddress: 'nohost.com',
    },
    pipe: client => {
      client.on('data', () => {});
      client.on('end', () => {
      });
    },
  },
};

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

  test('should getWhistleData return promise ', () => {
    expect(getWhistleData(whistleReq)).toBeInstanceOf(Promise);
  });

  kill(30013, 'tcp');

  const cb = jest.fn();
  const ctx = {
    set: name => name,
    req: {
      url: 'ke.qq.com',
      method: 'GET',
      headers: {
        'x-forwarded-for': 'localhost:9001',
      },
      _hasError: false,
      on: (type, callback) => callback(),
      once: (name, callback) => callback(),
      pipe: client => {
        client.on('data', () => {});
        client.on('end', () => {
        });
      },
      socket: {
        remoteAddress: 'nohost.com',
      },
    },
    res: {
      writeHead: cb,
    },
  };

  test('passToService', async () => {
    await passToService(ctx);
    expect(ctx.status).toBe(200);
  }, 30000);

  test('passToService with error', async () => {
    let time = 0;
    socket.on = (type, cbFunc) => {
      if (type === 'error' && time < 1) {
        cbFunc();
        time++;
      }
    };
    try {
      await passToService(ctx);
    } catch (e) {
      expect(e.toString()).toBe('Error: Closed');
    }
  });


  test('passToWhistle', async () => {
    whistleReq.req.writeHead = false;
    const res = await passToWhistle(whistleReq, reqSock);
    expect(res).toBe(undefined);
  });

  test('passToWhistle with writeHead false', async () => {
    whistleReq._hasError = false;
    whistleReq.req.writeHead = false;
    const res = await passToWhistle(whistleReq, reqSock);
    expect(res).toBe(undefined);
  });

  test('passToWhistle with writeHead true', async () => {
    whistleReq._hasError = false;
    reqSock.writeHead = () => true;
    const res = await passToWhistle(whistleReq, reqSock);
    expect(res).toBe(undefined);
  });
});
