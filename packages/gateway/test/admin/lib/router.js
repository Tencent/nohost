const Router = require('@nohost/router');

// 支持异步获取
const getServers = async () => {
  return [
    {
      host: '127.0.0.1',
      port: 7001,
    },
    {
      host: '127.0.0.1',
      port: 7002,
    },
  ];
};
const clusterRouter = new Router(getServers);

const routeMap = {
  1: {
    host: '127.0.0.1',
    port: 8899,
  },
  2: {
    host: '127.0.0.1',
    port: 8080,
  },
};

const envMap = {
  1: {
    space: '测试空间1',
    group: '测试分组1',
    env: '测试环境1',
  },
  12: {
    space: '测试空间1',
    group: '测试分组2',
    env: '测试环境1',
  },
  123: {
    space: '测试空间1',
    group: '测试分组2',
    env: '测试环境3',
  },
  2: {
    space: '测试空间2',
    group: '测试分组2',
    env: '测试环境2',
  },
  3: {
    space: '测试空间3',
    group: '测试分组3',
    env: '测试环境3',
  },
  4: {
    space: '测试空间4',
    group: '测试分组4',
    env: '测试环境4',
  },
  5: {
    space: '测试空间5',
    group: '测试分组5',
    env: '测试环境5',
  },
};
// 支持异步获取
const getRouteInfoById = async (id) => {
  return envMap[id];
};

const getRoute = async (id) => {
  return routeMap[id];
};

const handleResponse = (ctx, svrRes) => {
  ctx.status = svrRes.statusCode;
  ctx.set(svrRes.headers);
  ctx.body = svrRes;
};

module.exports = (router) => {
  router.all('/network/cluster/:id/(.*)', async (ctx) => {
    const { params: { id }, req, res } = ctx;
    const info = await getRouteInfoById(id);
    if (!info) {
      return;
    }
    req.url = req.url.replace(`/network/cluster/${id}`, '');
    const svrRes = await clusterRouter.proxyUI(req, res, info);
    handleResponse(ctx, svrRes);
  });
  router.all('/network/proxy/:id/(.*)', async (ctx) => {
    const { params: { id }, req, res } = ctx;
    const route = await getRoute(id);
    if (!route) {
      return;
    }
    req.url = req.url.replace(`/network/proxy/${id}`, '');
    const svrRes = await Router.proxyUI(req, res, route);
    handleResponse(ctx, svrRes);
  });
};
