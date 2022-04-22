const { Router } = require('../../../index');
const auth = require('./auth');
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
const envInfo = envMap[1];

module.exports = async (req/* , res */) => {
  const result = await auth(req);
  return result || {
    ...envInfo,
    router: clusterRouter,
    resRulesUrl: 'http://127.0.0.1:7003',
  };
};
