const http = require('http');

const HOST_RE = /^[\w.-]+$/;
const RETRY_COUNT = 5;
const TIMEOUT = 2000;
const noop = (_) => _;
const AUTH_URL = 'x-whistle-.script-auth-url';
const SNI_URL = 'x-whistle-.script-sni-url';
const REQ_RULES_URL = 'x-whistle-.script-req-rules-url';
const RES_RULES_URL = 'x-whistle-.script-res-rules-url';
const STATS_URL = 'x-whistle-.script-stats-url';
const DATA_URL = 'x-whistle-.script-data-url';
const POLICY = 'x-whistle-.script-policy';
const URL_RE = /^https?:\/\/[\w.-]/;

const addPlugins = (headers, plugins) => {
  if (!plugins) {
    return;
  }
  const {
    sniUrl,
    authUrl,
    resRulesUrl,
    statsUrl,
    dataUrl,
  } = plugins;
  const rulesUrl = plugins.rulesUrl || plugins.reqRulesUrl;
  let hasSni;
  let hasRemote;
  if (URL_RE.test(sniUrl)) {
    hasSni = true;
    headers[SNI_URL] = encodeURIComponent(sniUrl);
  }
  if (URL_RE.test(authUrl)) {
    hasRemote = true;
    headers[AUTH_URL] = encodeURIComponent(authUrl);
  }
  if (URL_RE.test(rulesUrl)) {
    hasRemote = true;
    headers[REQ_RULES_URL] = encodeURIComponent(rulesUrl);
  }
  if (URL_RE.test(resRulesUrl)) {
    hasRemote = true;
    headers[RES_RULES_URL] = encodeURIComponent(resRulesUrl);
  }
  if (URL_RE.test(dataUrl)) {
    hasRemote = true;
    headers[DATA_URL] = encodeURIComponent(resRulesUrl);
  }
  if (URL_RE.test(statsUrl)) {
    hasRemote = true;
    headers[STATS_URL] = encodeURIComponent(statsUrl);
  }
  if (hasSni || hasRemote) {
    headers[POLICY] = `${hasSni ? 'sni' : ''}${hasRemote ? 'remote' : ''}`;
  }
};

const getBody = (url) => {
  return new Promise((resolve, reject) => {
    let body = '';
    const timer = setTimeout(() => {
      client.destroy(); // eslint-disable-line
    }, TIMEOUT);
    const client = http.get(url, (res) => {
      clearTimeout(timer);
      if (res.statusCode !== 200) {
        return reject(new Error(`Response status code: ${res.statusCode}`));
      }
      res.setEncoding('utf8');
      res.on('data', (data) => {
        body += data;
      });
      res.on('end', () => resolve(body));
    });
    client.on('error', reject);
    client.end();
  });
};

const getJSON = async (url, retry) => {
  let result;
  try {
    result = await getBody(url);
  } catch (e) {
    if (retry > 0) {
      result = await getJSON(url, --retry);
    }
  }
  return result && JSON.parse(result);
};

exports.getJSON = (options) => getJSON(options, RETRY_COUNT);

const getWorkerNum = async ({ statusUrl }) => {
  try {
    const { workerNum } = await getJSON(statusUrl, RETRY_COUNT);
    return workerNum || 0;
  } catch (e) {}
  return 0;
};

const parseServers = (servers) => {
  const map = {};
  servers = servers.filter((server) => {
    const { host, port } = server;
    if (!HOST_RE.test(host) || !(port > 0 && port < 65535)) {
      return false;
    }
    const statusUrl = `http://${host}:${port}/status`;
    if (map[statusUrl]) {
      return false;
    }
    map[statusUrl] = 1;
    server.statusUrl = statusUrl;
    return true;
  });
  // 确保所有节点顺序一致
  return servers.sort((s1, s2) => {
    return s1.statusUrl > s2.statusUrl ? 1 : -1;
  });
};

exports.isFinished = (req) => {
  if (req.finished) {
    return true;
  }
  const { socket } = req;
  return socket && (socket.destroyed || !socket.writable);
};

exports.getServers = async (servers) => {
  try {
    servers = await servers;
  } catch (e) {
    return;
  }
  if (!servers || !Array.isArray(servers) || !servers.length) {
    return;
  }
  servers = parseServers(servers);
  if (!servers.length) {
    return;
  }
  const usableServers = await Promise.all(servers.map(async (server) => {
    const workerNum = await getWorkerNum(server);
    if (workerNum) {
      server.workerNum = workerNum;
      return server;
    }
  }));
  servers = usableServers.filter(noop);
  const map = {};
  const list = servers.map((server) => {
    const host = `${server.host}:${server.port}`;
    map[host] = server;
    return `${host}/${server.workerNum}`;
  });
  return list.length && {
    map,
    servers,
    base64: Buffer.from(list.join()).toString('base64'),
  };
};

exports.decode = (str) => {
  try {
    return decodeURIComponent(str);
  } catch (e) {}
  return str;
};

exports.addPlugins = addPlugins;
