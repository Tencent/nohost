module.exports = (options) => {
  options.totalReqs = 0;
  options.uiReqs = 0;
  options.upgradeReqs = 0;
  options.tunnelReqs = 0;
  options.totalQps = 0;
  options.uiQps = 0;
  options.accountPluginPath = options.accountPluginPath || options.workerPluginPath;
  let totalReqs = 0;
  let uiReqs = 0;
  let now = Date.now();
  setInterval(() => {
    const cur = Date.now();
    const cost = cur - now || 1;
    options.totalQps = ((options.totalReqs - totalReqs) * 1000 / cost).toFixed(2);
    options.uiQps = ((options.uiReqs - uiReqs) * 1000 / cost).toFixed(2);
    totalReqs = options.totalReqs;
    uiReqs = options.uiReqs;
    now = cur;
  }, 1000);
  module.exports = options;
};
