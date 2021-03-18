
const http = require('http');
const path = require('path');

const filePath = path.join(process.cwd(), 'test/app/assets');

const socket = {
  remotePort: 9001,
  on: () => true,
  once: () => true,
  removeAllListeners: () => true,
  destroy: () => true,
  write: () => true,
  end: () => true,
  pipe: () => true,
};

const headers = {
  'content-length': 10,
  'x-forwarded-for': 'localhost:9001',
};

/**
 * @description 设置证书所需的路径，避免文件报错
 */
const setPath = () => {
  process.env.WHISTLE_PATH = filePath;
};

/**
 * @description 封装通用的 http 请求方法
 * @param {string} rquestPath   http://127.0.0.1:3001
 */
const httpRequire = (rquestPath) => {
  return new Promise((resolve) => {
    http.get(rquestPath, (data) => {
      let str = '';
      data.on('data', (chunk) => {
        str += chunk;// 监听数据响应，拼接数据片段
      });
      data.on('end', () => {
        resolve(str);
      });
    });
  });
};

const httpPost = (options) => {
  return new Promise((resolve) => {
    const req = http.request(options, (data) => {
      let str = '';
      data.on('data', (chunk) => {
        str += chunk;// 监听数据响应，拼接数据片段
      });
      data.on('end', () => {
        resolve(str);
      });
    });
    req.end();
  });
};

/**
 * @description 获取mock whistleReq
 */
const getMockWhistleReq = () => {
  return {
    headers,
    _hasError: false,
    dispatch(name) {
      this.dispatchList[name]();
    },
    dispatchList: [],
    on (type, cb) {
      this.dispatchList[type] = cb();
    },
    once: (type, cb) => cb(),
    socket,
    set: () => true,
    pipe: client => {
      client.on('data', () => {});
      client.on('end', () => {
      });
    },
    req: {
      writeHead: false,
      socket,
      headers,
      ...socket,
    },
  };
};

const getMockSocket = () => {
  return socket;
};

exports.setPath = setPath;
exports.httpRequire = httpRequire;
exports.httpPost = httpPost;
exports.getMockWhistleReq = getMockWhistleReq;
exports.getMockSocket = getMockSocket;
