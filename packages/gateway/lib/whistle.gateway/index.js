const Router = require('@nohost/router');
const { notEmptyStr } = require('../util');

const getBody = (body) => {
  if (body == null) {
    return '';
  }
  return Buffer.isBuffer(body) ? body : `${body}`;
};

const handleResponse = async (res, svrRes, type) => {
  if (type === 'ws' || type === 'tunnel') {
    return;
  }
  let done;
  res.writeHead(svrRes.statusCode, svrRes.headers);
  svrRes.on('error', (err) => {
    if (!done) {
      done = true;
      res.emit('error', err);
    }
  });
  svrRes.pipe(res);
};

module.exports = async (server, { handlers }) => {
  const handleRequest = async (req, res, type) => {
    const handle = handlers[type] || handlers.http;
    const {
      headers,
      remoteAddress,
      remotePort,
      fullUrl,
    } = req.originalReq;
    req.headers = headers;
    // 让 router 转发后保留 https 协议
    if (req.isHttps) {
      req.url = fullUrl[0] === 'w' ? fullUrl.replace('ws', 'http') : fullUrl;
    }
    const result = handle && (await handle(req, res));
    if (!result) {
      return req.passThrough();
    }
    const {
      statusCode,
      headers: resHeaders,
      body,
      router,
      host,
      port,
      isUIRequest,
    } = result;
    let svrRes;
    if (statusCode > 0) {
      res.writeHead(statusCode, resHeaders);
      if (typeof result.pipe === 'function') {
        svrRes = result;
      } else if (typeof body?.pipe === 'function') {
        svrRes = body;
      }
      if (svrRes) {
        svrRes.on('error', err => res.emit('error', err));
        return svrRes.pipe(res);
      }
      return res.end(getBody(body));
    }
    if (notEmptyStr(host) && port > 0) {
      req.isUIRequest = isUIRequest;
      svrRes = await Router.proxy(req, res, result);
      await handleResponse(res, svrRes, type);
      return;
    }
    if (typeof router?.proxy !== 'function') {
      return req.passThrough();
    }
    headers['x-whistle-remote-address'] = remoteAddress;
    headers['x-whistle-remote-port'] = remotePort;
    svrRes = await router.proxy(req, res, result);
    await handleResponse(res, svrRes, type);
  };
  server.on('request', handleRequest);
  server.on('upgrade', (req, socket) => {
    handleRequest(req, socket, 'ws');
  });
  server.on('connect', (req, socket) => {
    handleRequest(req, socket, 'tunnel');
  });
};
