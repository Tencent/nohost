const proxy = require('./cgi/proxy');
const { AUTH_KEY } = require('../util');

const CGI_MAP = {
  'add-env': 'rules/add',
  'add-top-env': 'rules/project',
  'add-top-rules': 'rules/project',
  'add-rules': 'rules/add',
  'modify-env': 'rules/add',
  'modify-rules': 'rules/add',
  'remove-env': 'rules/remove',
  'remove-rules': 'rules/remove',
  'rename-env': 'rules/rename',
  'rename-rules': 'rules/rename',
  list: 'rules/list',
};

module.exports = async (ctx, next) => {
  const name = ctx.get('x-nohost-account-name');
  let { cgiName } = ctx.params;
  cgiName = CGI_MAP[cgiName];
  const account = cgiName && ctx.accountMgr.getAccount(name);
  if (!account) {
    return;
  }
  const autKey = ctx.get('x-nohost-auth-key') || '';
  if (autKey !== ctx.accountMgr.getAuthKey()) {
    ctx.status = 403;
    return;
  }
  const { req } = ctx;
  req.headers['x-whistle-auth-key'] = AUTH_KEY;
  let { url } = req;
  const index = url.indexOf('?');
  url = index === -1 ? '' : url.substring(index);
  req.url = `/account/${name}/cgi-bin/${cgiName}${url}`;
  ctx.account = account;
  await proxy(ctx, next);
};
