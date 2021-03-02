const path = require('path');
const kill = require('kill-port');

const filePath = path.join(process.cwd(), 'test');
process.env.WHISTLE_PATH = filePath;

const createServer = require('../../lib/index');

const options = {
  username: 'admin',
  password: '123456',
  port: '3002',
  storage: '127.0.0.1:9001~9999',
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
  req: {
    on: () => true,
    once: () => true,
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

const reqSock = {
  on: type => type,
  once: type => type,
  pipe: () => reqSock,
};

jest.mock('../../lib/main/index');
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
      };
      cb(obj);
      return obj;
    },
    createServer: (callback) => {
      Promise.resolve().then(() => callback(whistleReq, reqSock));
      return {
        on: (type, cb) => cb(whistleReq, reqSock),
        listen: (port, host, cb) => cb(),
        removeAllListeners: () => true,
        close: (cb) => cb(),
      };
    },
  };
});

// kill(8080, 'tcp');

describe('lib index', () => {
  test('createServer', () => {
    const cb = jest.fn();
    createServer(options, cb);
    expect(cb).toBeCalled();
    kill(30017, 'tcp');
  });
});

describe('lib index with storage is 127.0.0.1:9001', () => {
  test('createServer', () => {
    const cb = jest.fn();
    options.storage = '127.0.0.1:9001';
    createServer(options, cb);
    expect(cb).toBeCalled();
    kill(30017, 'tcp');
  });
});

describe('lib index with storage is abc', () => {
  test('createServer', () => {
    const cb = jest.fn();
    whistleReq.headers.host = '';
    options.storage = 'abc';
    createServer(options, cb);
    expect(cb).toBeCalled();
    kill(30017, 'tcp');
  });
});

describe('lib index with headers', () => {
  test('createServer', () => {
    const cb = jest.fn();
    whistleReq.headers['x-whistle-nohost-env'] = '$123';
    whistleReq.headers['x-whistle-nohost-rule'] = '$123';
    whistleReq.headers['x-whistle-nohost-value'] = '$123';

    createServer(options, cb);
    expect(cb).toBeCalled();
    kill(30017, 'tcp');
  });
});
