const setForwardRule = (domain) => {
  return `${domain} http://127.0.0.1:8080`;
};

module.exports = (ctx) => {
  const list = ctx.storage.getDomainList().map(setForwardRule);
  ctx.body = list.join('\n');
};
