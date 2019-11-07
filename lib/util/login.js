const crypto = require('crypto');
const getAuth = require('basic-auth');

const ENV_MAX_AGE = 60 * 60 * 24 * 3;

const shasum = (str) => {
  if (typeof str !== 'string') {
    str = '';
  }
  const result = crypto.createHash('sha1');
  result.update(str);
  return result.digest('hex');
};
exports.shasum = shasum;

const getLoginKey = (ctx, username, password) => {
  const ip = ctx.ip || '127.0.0.1';
  return shasum(`${username || ''}\n${password || ''}\n${ip}`);
};

exports.checkLogin = (ctx, authConf) => {
  const {
    username,
    password,
    nameKey,
    authKey,
  } = authConf;

  if (!username || !password) {
    return true;
  }
  const curName = ctx.cookies.get(nameKey);
  const lkey = ctx.cookies.get(authKey);
  const correctKey = getLoginKey(ctx, username, password);
  if (curName === username && correctKey === lkey) {
    return true;
  }

  /* eslint-disable prefer-const */
  let { name, pass } = getAuth(ctx.req) || {};
  if (name === username && pass === password) {
    const options = {
      expires: new Date(Date.now() + (ENV_MAX_AGE * 1000)),
      path: '/',
    };
    ctx.cookies.set(nameKey, username, options);
    ctx.cookies.set(authKey, correctKey, options);
    return true;
  }

  ctx.status = 401;
  ctx.set('WWW-Authenticate', ' Basic realm=User Login');
  ctx.set('Content-Type', 'text/html; charset=utf8');
  ctx.body = 'Access denied, please <a href="javascript:;" onclick="location.reload()">try again</a>.';
  return false;
};
