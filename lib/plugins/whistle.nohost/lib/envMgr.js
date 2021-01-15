const LRU = require('lru-cache');
const {
  COOKIE_NAME,
  WHISTLE_ENV_HEADER,
  decodeURIComponentSafe,
  getClientId,
  isFromComposer,
} = require('./util');

const followers = new LRU({ max: 10000, maxAge: 1000 * 60 * 30 });
const cache = new LRU({ max: 10000 });
let accountMgr;

class EnvMgr {
  checkEnvName({ envList }, envName) {
    if (!envName) {
      return '';
    }
    return envList.some(({ name }) => name === envName) ? envName : '';
  }

  setFollower(followIp, ctx) {
    const clientIp = ctx.ip;
    if (clientIp !== followIp) {
      const env = cache.get(ctx.ip);
      if (env != null) {
        followers.set(followIp, clientIp);
        return true;
      }
    }
    return false;
  }

  unfollow(ctx) {
    followers.del(ctx.ip);
  }

  getFollower(ctx) {
    return followers.get(ctx.ip);
  }

  setEnv(ip, name, envName) {
    const account = accountMgr.getAccount(name);
    if (!account) {
      cache.set(ip, '');
      return;
    }
    envName = this.checkEnvName(account, envName);
    const env = { name, envName };
    cache.set(ip, env);
    return env;
  }

  getEnvFromCookie(ctx, withAccount) {
    let env = decodeURIComponentSafe(ctx.cookies.get(COOKIE_NAME));
    if (!env) {
      return '';
    }
    const index = env.indexOf('/');
    let name = env;
    let envName;
    if (index !== -1) {
      name = env.substring(0, index);
      envName = env.substring(index + 1);
    }
    const account = accountMgr.getAccount(name);
    if (!account) {
      return '';
    }
    envName = this.checkEnvName(account, envName);
    env = { name, envName };
    return withAccount ? { account, env } : { name, envName };
  }

  getEnv(ctx) {
    let env = cache.get(getClientId(ctx));
    if (env != null) {
      if (env) {
        const { name, envName } = env;
        const account = accountMgr.getAccount(name);
        if (!account || !this.checkEnvName(account, envName)) {
          env.envName = '';
        }
      }
      return env;
    }
    env = this.getEnvFromCookie(ctx);
    cache.set(getClientId(ctx), env);
    return env;
  }

  getEnvOnly(ctx) {
    return cache.get(getClientId(ctx));
  }

  getEnvByHeader(ctx) {
    let name = decodeURIComponentSafe(ctx.get(WHISTLE_ENV_HEADER));
    if (!name) {
      return (isFromComposer(ctx) && this.getEnvFromCookie(ctx, true)) || '';
    }
    const index = name.indexOf('/');
    let envName = '';
    if (index !== -1) {
      envName = name.substring(index + 1);
      name = name.substring(0, index);
    }
    const account = accountMgr.getAccount(name);
    if (!account) {
      return '';
    }
    envName = this.checkEnvName(account, envName);
    return { account, env: { name, envName } };
  }
}

module.exports = (mgr) => {
  accountMgr = mgr;
  module.exports = new EnvMgr();
};
