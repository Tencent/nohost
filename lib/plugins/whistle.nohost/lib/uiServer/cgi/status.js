const { WORKER_NUM } = require('../../util');

const STATUS = { workerNum: WORKER_NUM };
let allWorkers = [];
let envWorkerMap = {};
let curWorkerInfo;
const MAX_CACHE_TIME = 1000 * 60 * 12;
const WORKER_INFO_RE = /^\d{1,3}(\.\d{1,3}){3}:\d{1,5}\/[1-9]\d*(,\d{1,3}(\.\d{1,3}){3}:\d{1,5}\/[1-9]\d*)*$/;

const parseWorker = (item) => {
  item = item.split('/');
  const index = parseInt(item[1], 10);
  item = item[0].split(':');
  return {
    index,
    envNum: 0,
    host: item[0],
    port: parseInt(item[1], 10),
  };
};

setInterval(() => {
  const now = Date.now();
  let isChanged;
  Object.keys(envWorkerMap).forEach((env) => {
    const { updateTime, worker } = envWorkerMap[env];
    if (now - updateTime > MAX_CACHE_TIME) {
      delete envWorkerMap[env];
      --worker.envNum;
      isChanged = true;
    }
  });
  if (isChanged) {
    allWorkers.sort((w1, w2) => {
      return w1.envNum > w2.envNum ? 1 : -1;
    });
  }
}, 30000);

const flattenWorkers = (workerList) => {
  const result = [];
  let len = workerList.length;
  while (workerList.length) {
    for (let i = len - 1; i >= 0; i--) {
      const worker = workerList[i];
      --worker.index;
      if (!worker.index) {
        workerList.splice(i, 1);
      }
      result.push(Object.assign({}, worker, STATUS));
    }
    len = workerList.length;
  }
  return result;
};

const update = (options) => {
  if (!options || curWorkerInfo === options) {
    return allWorkers;
  }
  let workerList;
  try {
    workerList = Buffer.from(options, 'base64').toString();
    if (!WORKER_INFO_RE.test(workerList)) {
      return allWorkers;
    }
  } catch (e) {
    return allWorkers;
  }
  curWorkerInfo = options;
  workerList = workerList.split(',').map(parseWorker);
  allWorkers = flattenWorkers(workerList);
  envWorkerMap = {};
  return allWorkers;
};

const notEmptyStr = (str) => {
  return str && typeof str === 'string';
};

const getWorker = ({ space, group, env }, servers) => {
  if (!notEmptyStr(space) || !notEmptyStr(group) || !update(servers).length) {
    return STATUS;
  }
  env = [space, group, env || ''].join('/');
  const info = envWorkerMap[env];
  if (info) {
    info.updateTime = Date.now();
    return info.worker;
  }
  const worker = allWorkers[0];
  ++worker.envNum;
  envWorkerMap[env] = {
    updateTime: Date.now(),
    worker,
  };
  const index = allWorkers.indexOf(worker);
  for (let i = allWorkers.length - 1; i > index; i--) {
    const next = allWorkers[i];
    if (!next || worker.envNum > next.envNum) {
      allWorkers[i] = worker;
      allWorkers[index] = next;
      return worker;
    }
  }
  return worker;
};


module.exports = (ctx) => {
  const servers = ctx.get('x-nohost-servers');
  const { query } = ctx.request;
  ctx.body = getWorker(query, servers);
};
