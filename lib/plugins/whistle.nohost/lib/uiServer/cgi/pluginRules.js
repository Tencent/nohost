
module.exports = (ctx) => {
  const { priPatterns, pubPatterns, getBaseUrl } = ctx.accountMgr;
  const baseUrl = getBaseUrl();
  if (baseUrl) {
    ctx.body = priPatterns.concat(pubPatterns).map((pattern) => {
      return `${pattern} internal-proxy://${baseUrl}`;
    }).join('\n');
  } else {
    ctx.body = '';
  }
};
