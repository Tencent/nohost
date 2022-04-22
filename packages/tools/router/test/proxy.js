const http = require('http');
const Router = require('../lib');

const {
  writeHead,
  writeError,
  // CLIENT_ID,
} = Router;
// router 会自动去重
const servers = [
  {
    host: '127.0.0.1',
    port: 8080,
  },
  {
    host: '127.0.0.1',
    port: 8080,
  },
];

const router = new Router(servers);

const getOptions = (req) => {
  const { headers } = req;
  const spaceName = 'imweb';
  let groupName;
  let envName;
  let clientId;
  if (headers.host === 'km.oa2.com') {
    groupName = 'avenwu';
    envName = '测试'; // 可选
  } else if (req.headers.host !== 'km.oa.com') {
    groupName = 'avenwu2';
    envName = '测试2'; // 可选
    if (req.headers.host === 'ke.qq.com') {
      clientId = 'test';
    }
  }

  return {
    rules: 'file://{test.html} km.oa2.com www.test2.com',
    values: { 'test.html': 'hell world.' },
    spaceName,
    groupName,
    envName,
    clientId,
    // callback: console.log, // 可选
  };
};

const server = http.createServer(async (req, res) => {
  try {
    const svrRes = await router.proxy(req, res, getOptions(req));
    writeHead(res, svrRes);
    svrRes.pipe(res);
  } catch (err) {
    writeError(res, err);
  }
});

const handleSocket = async (req, socket) => {
  router.proxy(req, socket, getOptions(req));
};
// TCP 请求
server.on('connect', handleSocket);
// WebSocket 请求
server.on('upgrade', handleSocket);

server.listen(5566);
