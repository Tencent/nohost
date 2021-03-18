const { setPath } = require('../utils');

setPath();

jest.mock('../../lib/main/util', () => {
  return {
    passToWhistle: () => true,
    passToService: () => true,
  };
});

jest.mock('http', () => {
  let i = 0;
  const reqSock = {
    on: type => type,
    once: type => type,
    pipe: () => reqSock,
    setHeader: () => jest.fn(),
    end: () => jest.fn(),
  };

  const whistleReq = {
    headers: {
      'content-length': 10,
      'x-forwarded-for': 'localhost:9001',
      host: 'admin.nohost.pro',
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
      end: () => true,
    },
    set: () => true,
    pipe: client => {
      client.on('data', () => {});
      client.on('end', () => {
      });
    },
    setHeader: () => jest.fn(),
    req: {
      on: () => true,
      once: () => true,
      setHeader: () => jest.fn(),
      headers: {
        'x-forwarded-for': 'localhost:9001',
      },
      socket: {
        remoteAddress: 'nohost.com',
        end: () => true,
      },
      pipe: client => {
        client.on('data', () => {});
        client.on('end', () => {
        });
      },
    },
  };

  const runConfig = ['', '',
    () => {
      whistleReq.headers.host = '';
    },
    () => {
      whistleReq.headers = {
        host: null,
        'x-whistle-nohost-env': '$123',
        'x-whistle-nohost-rule': '$123',
        'x-whistle-nohost-value': '$123',
      };
    },
  ];

  function changeReq() {
    const fn = runConfig[i];
    if (fn) { fn(); }
    i++;
  }
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
      };
      cb(obj);
      return obj;
    },
    createServer: (callback) => {
      changeReq();
      callback(whistleReq, reqSock);
      return {
        on: (type, cb) => cb(whistleReq, reqSock),
        listen: (port, host, cb) => cb(),
        removeAllListeners: () => true,
        close: (cb) => cb(),
      };
    },
  };
});

const createServer = require('../../lib/index');

const options = {
  username: 'admin',
  password: '123456',
  port: '3032',
  storage: '127.0.0.1:9001~9999',
};


describe('lib index', () => {
  test('createServer', () => {
    const cb = jest.fn();
    const server = createServer(options, cb);
    expect(server.timeout).toBe(360000);
  });
});

describe('lib index with storage is 127.0.0.1:10021', () => {
  test('should option return array and port is 10021', () => {
    const cb = jest.fn();
    options.port = '10021';
    options.storage = '127.0.0.1:10021';
    createServer(options, cb);
    expect(options.storage[0].port).toBe(10021);
  });
});

describe('lib index with storage is abc', () => {
  test('createServer', () => {
    const cb = jest.fn();
    options.port = '10009';
    options.storage = 'abc';
    createServer(options, cb);
    expect(options.storage).toBeUndefined();
  });
});

describe('lib index with headers', () => {
  test('should whistleReq.header.host', () => {
    const cb = jest.fn();
    options.port = '10031';
    options.storage = '127.0.0.1:9001~9999';
    createServer(options, cb);
    expect(options.port).toBe(10031);
  });
});
