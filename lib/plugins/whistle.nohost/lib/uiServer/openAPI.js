const proxy = require('./cgi/proxy');
const accountMgr = require('../accountMgr');
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

const getRules = (options) => {
  const { account, name, env, envName } = options;
  let { rules = '', headers } = accountMgr.getRules(account || name, env || envName);
  if (headers) {
    headers = JSON.stringify(headers);
    if (headers.length > 2) {
      rules += `\n* reqHeaders://(${headers})`;
    }
  }
  return rules;
};

module.exports = async (ctx, next) => {
  let { cgiName } = ctx.params;
  const authKey = ctx.accountMgr.getAuthKey();
  if (cgiName === 'rules') {
    const { query } = ctx.request;
    if (!authKey || authKey !== query.authKey) {
      ctx.status = 403;
      return;
    }
    ctx.body = getRules(query);
    return;
  }
  cgiName = CGI_MAP[cgiName];
  const name = ctx.get('x-nohost-account-name');
  const account = cgiName && ctx.accountMgr.getAccount(name);
  if (!account) {
    return;
  }
  const curAuthKey = authKey && ctx.get('x-nohost-auth-key');
  if (!curAuthKey || (authKey !== curAuthKey && curAuthKey !== ctx.accountMgr.defaultAuthKey)) {
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
