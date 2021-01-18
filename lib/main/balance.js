const allWorkers = [];
const allServers = [];
const envWorkerMap = {};
let curWorkerInfo;
const WORKER_INFO_RE = /^\d{1,3}(\.\d{1,3}){3}:\d{1,5}\.[1-9]\d*(,\d{1,3}(\.\d{1,3}){3}:\d{1,5}\.[1-9]\d*)*$/;

exports.update = (options) => {
  if (!WORKER_INFO_RE.test(options)) {
    return;
  }
  options = options.split(',').sort();
};

exports.getWorker = ({ space, group, env }) => {
  if (!allServers.length) {
    return;
  }
  let worker;
  if (space && group) {
    env = [space, group, env || ''].join('/');
    worker = envWorkerMap[env];
    if (worker) {
      return worker;
    }
  } else {
    env = '';
  }
};
