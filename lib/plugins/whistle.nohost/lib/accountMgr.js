const getValue = require('lodash.get');
const { isIP } = require('net');
const util = require('./util');
const { getServerIp } = require('../../../util/address');
const parseDomain = require('../../../util/parseDomain');

const { parseJSON, shasum } = util;
const MAX_ACCOUNT_COUNT = 120;
const MAX_PASSWORD_LENGTH = 24;
const KEY_RE = /^@(?:([\w.-]{1,64})(\/[^\s]+)?|\(([^\s]+)\))$/mg;
const NAME_RE = /^[\w.-]{1,24}$/;
const CRLF_RE = /\s*[\r\n]+\s*/g;
const CONFIG_RE = /^([\w-]{1,64}:?|[\w.-]{1,64}:)(?:\s+([\w.:/-]*[\w-]))?$/mg;
const ACCOUNT_NAME_VAR = /\$\{name\}/g;
const VAR_RE = /\$\{([\w.]+)\}/g;
const JSON_DATA_LEN = 30720;
const RULES_TPL_LEN = 3072;
const DEFAULT_RULES_LEN = 5120;
const NOHOST_VAR_RE = /^nohost_\w+$/;
const AUTH_KEY_RE = /^[\w.@-]{1,32}$/;
const SPECIAL_CHAR_RE = /[.$]/g;
const VALUE_RE = /(?:^[^\n\r\S]*(```+)[^\n\r\S]*\S+[^\n\r\S]*[\r\n][\s\S]+?[\r\n][^\n\r\S]*\1\s*|#.*)$/mg;
const INDEX_RE = /^(-?\d{1,15})\)/;
const INLINE_RULE_RE = /^\s*rules(``?)\s*[\r\n]([\w\W]+?)[\r\n]\s*\1\s*$/mg;
const DOMAIN_RE = /^(?:\*(\**)|[\w-]+)(?:\.[\w-]+)+$/;

let port = 8080;
let accountMap;
let storage;
let certsDomain;
let domainList = [];

const trimRules = (rules) => {
  return rules.trim().replace(VALUE_RE, all => (all[0] === '#' ? '' : all)).replace(CRLF_RE, '\n');
};

const parseValues = (rules) => {
  const values = {};
  let index = 0;
  rules = rules.trim().replace(VALUE_RE, (all) => {
    if (all[0] === '#') {
      return '';
    }
    const key = `#${++index}`;
    values[key] = all;
    return key;
  }).replace(CRLF_RE, '\n');
  return { rules, values };
};

const parseRule = (rules, defaultRules, testRules, varRegExp, keyValueMap) => {
  const headers = {};
  const { rules: pureRules, values } = parseValues(rules);
  rules = pureRules.replace(CONFIG_RE, (_, key, value) => {
    if (value) {
      if (key.slice(-1) === ':') {
        key = key.slice(0, -1);
      }
      key = `x-nohost-${key}`;
      if (!headers[key]) {
        headers[key] = value;
      }
    }
    return '';
  }).trim();
  const env = headers['x-nohost-env'];
  delete headers['x-nohost-env'];
  Object.keys(values).forEach((k) => {
    rules = rules.replace(k, values[k]);
  });
  rules = [rules];
  if (testRules && env !== 'prod' && env !== 'production' && Object.keys(headers).length) {
    rules.push(testRules);
  }
  if (defaultRules) {
    rules.push(defaultRules);
  }
  rules = rules.join('\n');
  if (keyValueMap) {
    rules = rules.replace(varRegExp, (all, space, key) => {
      return `${space || ''}${keyValueMap[key]}`;
    });
  }
  return { rules, headers };
};

const getString = (data) => {
  const type = typeof data;
  if (type === 'number') {
    return String(data);
  }
  return typeof data === 'string' ? data : '';
};

const getStringProperty = (name) => {
  return getString(storage.getProperty(name));
};

const sorter = (cur, next) => {
  if (cur.index === next.index) {
    return 0;
  }
  return cur.index > next.index ? -1 : 1;
};

const parseEntryPatterns = (str) => {
  let patterns = [];
  const preRules = [];
  const postRules = [];
  const allowlist = [];

  str.trim().replace(INLINE_RULE_RE, (_, pos, rules) => {
    rules = rules.trim();
    if (!rules) {
      return;
    }
    if (pos.length === 1) {
      preRules.push(rules);
    } else {
      postRules.push(rules);
    }
    return '';
  }).split(/\s+/).map((pattern) => {
    if (pattern[0] === '#') {
      return;
    }
    let index = 0;
    if (INDEX_RE.test(pattern)) {
      index = parseInt(RegExp.$1, 10);
      pattern = pattern.substring(pattern.indexOf(')') + 1);
      if (!pattern) {
        return;
      }
    }
    if (pattern[0] === '-') {
      const ignore = pattern[1] === '-';
      pattern = pattern.substring(ignore ? 2 : 1);
      if (pattern) {
        patterns.push({ pattern, index, ignore });
      }
    } else {
      patterns.push({ pattern, index, button: true });
    }
    return pattern;
  });
  if (certsDomain) {
    certsDomain.forEach((domain) => {
      patterns.push({ pattern: domain, index: 0, button: true });
    });
  }
  const map = {};
  const entryRules = [];
  const addAllowlist = (pattern) => {
    if (pattern && allowlist.indexOf(pattern) === -1) {
      allowlist.push(pattern);
    }
  };
  patterns = patterns.sort(sorter).filter((item) => {
    let { pattern } = item;
    if (!map[pattern]) {
      map[pattern] = 1;
      if (DOMAIN_RE.test(pattern) || pattern === 'localhost') {
        const stars = RegExp.$1;
        if (stars) {
          pattern = pattern.replace(stars, '');
          if (stars.length > 1) {
            addAllowlist(pattern.substring(2));
          }
        }
        addAllowlist(pattern);
      }
      entryRules.push(`${item.pattern} whistle.nohost://${item.button ? '' : 'none'}`);
      return true;
    }
  });
  if (!map['local.whistlejs.com']) {
    entryRules.push('local.whistlejs.com whistle.nohost://none');
  }
  return {
    patterns,
    preRules,
    postRules,
    allowlist,
    entryRules: entryRules.join('\n'),
  };
};

class AccountMgr {
  constructor() {
    this.parseJsonData(getStringProperty('jsonData'));
    this.parseRules();
    this.parsePatterns();
  }

  enableGuest(enable) {
    storage.setProperty('enableGuest', enable);
  }

  isEnableGuest() {
    const enable = storage.getProperty('enableGuest');
    return !!enable || enable === undefined;
  }

  parseTpl(name) {
    let { pureRulesTpl, jsonData } = this;
    if (!pureRulesTpl) {
      return '';
    }
    pureRulesTpl = pureRulesTpl.replace(ACCOUNT_NAME_VAR, name);
    pureRulesTpl = pureRulesTpl.replace(VAR_RE, (all, varName) => getString(getValue(jsonData, varName)));
    return pureRulesTpl;
  }

  parsePatterns() {
    const entryPatterns = getStringProperty('entryPatterns');
    this.entryPatterns = entryPatterns;
    const {
      entryRules,
      patterns,
      preRules,
      postRules,
      allowlist,
    } = parseEntryPatterns(entryPatterns);
    this.entryRules = entryRules;
    this.patterns = patterns;
    this.preRules = preRules;
    this.postRules = postRules;
    this.allowlist = allowlist;
  }

  parseRules() {
    const result = {};
    const accountList = this.loadAllAccounts();
    const list = [];
    const rulesTpl = getStringProperty('rulesTpl');
    let defaultRules = getStringProperty('defaultRules');
    const accountRules = getStringProperty('accountRules');
    let testRules = getStringProperty('testRules');
    this.rulesTpl = rulesTpl;
    this.pureRulesTpl = trimRules(rulesTpl);
    this.defaultRules = defaultRules;
    this.accountRules = accountRules;
    this.testRules = testRules;
    this.parsedMap = {};
    accountMap = {};
    accountList.forEach((account) => {
      const { name, envList, active } = account;
      accountMap[name] = account;
      if (!active) {
        return;
      }
      envList.forEach((env) => {
        const rules = trimRules(`${env.rules}`);
        const key = `${name}/${env.name}`;
        env = { key, rules };
        result[key] = rules;
        list.push(env);
      });
    });

    const dependencies = {};
    list.forEach((env) => {
      let { key, rules } = env;
      if (!rules) {
        return;
      }
      const { rules: pureRules, values } = parseValues(rules);
      rules = pureRules.replace(KEY_RE, (all, name, envName, value) => {
        envName = envName && envName.slice(1);
        if (value || !envName) {
          return this.parseTpl(value || name);
        }
        all = `${name}/${envName}`;
        if (all === key || result[all] == null) {
          return '';
        }
        const deps = dependencies[key];
        if (deps) {
          const index = deps.indexOf(all);
          if (index === -1) {
            deps.push(all);
          }
        } else {
          dependencies[key] = [all];
        }
        return all;
      });
      Object.keys(values).forEach((k) => {
        rules = rules.replace(k, values[k]);
      });
      result[key] = rules;
    });
    list.forEach((env) => {
      const { key } = env;
      const allDeps = { [key]: 1 };
      const parseDeps = (k) => {
        let rules = result[k];
        if (!rules) {
          allDeps[k] = 1;
          return '';
        }
        const deps = dependencies[k];
        if (deps) {
          deps.forEach((d) => {
            const exists = allDeps[d];
            rules = rules.split(d);
            if (!exists) {
              allDeps[d] = 1;
              rules.splice(rules.length - 1, 0, parseDeps(d));
            }
            rules = rules.join('');
          });
        }
        return rules;
      };
      env.rules = parseDeps(key);
    });
    defaultRules = trimRules(defaultRules);
    testRules = trimRules(testRules);
    const { varRegExp, keyValueMap } = this;
    list.forEach((env) => {
      this.parsedMap[env.key] = parseRule(env.rules, defaultRules, testRules, varRegExp, keyValueMap);
    });
  }

  parseJsonData(data) {
    this.jsonDataStr = data;
    data = parseJSON(data) || {};
    this.jsonData = data;
    this.keyValueMap = null;
    this.varRegExp = null;
    const regExp = [];
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value) {
        const isVar = NOHOST_VAR_RE.test(key);
        if (isVar || (isIP(key) === 4 && isIP(value) === 4)) {
          this.keyValueMap = this.keyValueMap || {};
          key = `${isVar ? '$' : ''}${key}`;
          this.keyValueMap[key] = value;
          regExp.push(`${key.replace(SPECIAL_CHAR_RE, '\\$&')}`);
        }
      }
    });
    if (this.keyValueMap) {
      this.varRegExp = new RegExp(`(^|\\s)(${regExp.join('|')})\\b`, 'mg');
    }
  }

  setJsonData(str) {
    str = getString(str);
    if (str.length > JSON_DATA_LEN) {
      return;
    }
    this.parseJsonData(str);
    storage.setProperty('jsonData', str);
    this.parseRules();
  }

  setRulesTpl(str) {
    str = getString(str);
    if (str.length > RULES_TPL_LEN) {
      return;
    }
    storage.setProperty('rulesTpl', str);
    this.parseRules();
  }

  setEntryPatterns(str) {
    str = getString(str);
    if (str.length > DEFAULT_RULES_LEN) {
      return;
    }
    storage.setProperty('entryPatterns', str);
    this.parsePatterns();
  }

  setDefaultRules(str) {
    str = getString(str);
    if (str.length > DEFAULT_RULES_LEN) {
      return;
    }
    storage.setProperty('defaultRules', str);
    this.parseRules();
  }

  setAccountRules(str) {
    str = getString(str);
    if (str.length > DEFAULT_RULES_LEN) {
      return;
    }
    storage.setProperty('accountRules', str);
    this.parseRules();
  }

  setTestRules(str) {
    str = getString(str);
    if (str.length > DEFAULT_RULES_LEN) {
      return;
    }
    storage.setProperty('testRules', str);
    this.parseRules();
  }

  loadAllAccounts() {
    let count = MAX_ACCOUNT_COUNT;
    const result = [];
    storage.getFileList(true).some((file) => {
      let { account } = file;
      if (!account) {
        account = parseJSON(file.data);
        file.account = account;
      }
      if (!account || !this.checkName(account.name)
        || this.checkPassword(account.password)
        || !Array.isArray(account.envList)) {
        return false;
      }
      if (--count < 0) {
        return true;
      }
      result.push(account);
      return false;
    });
    return result;
  }

  addEnvList(accountName, envList) {
    const account = this.getAccount(accountName);
    if (!account) {
      return false;
    }
    const list = [];
    envList.forEach(({ name, data }) => {
      if (name) {
        list.push({
          name,
          rules: data,
        });
      }
    });
    account.envList = list;
    this.saveAccount(account);
    this.parseRules();
    return true;
  }

  checkName(name) {
    return typeof name === 'string' && NAME_RE.test(name);
  }

  checkPassword(password) {
    if (typeof password !== 'string') {
      return false;
    }
    const len = password.length;
    return len > 0 && len <= MAX_PASSWORD_LENGTH;
  }

  changePassword(name, password) {
    if (!this.checkPassword(password)) {
      return false;
    }
    const account = this.getAccount(name);
    if (!account) {
      return false;
    }
    account.password = shasum(password);
    this.saveAccount(account);
    return true;
  }

  /**
   * 修改通知内容
   */
  changeNotice(name, notice) {
    const account = this.getAccount(name);
    if (!account) {
      return false;
    }

    if (typeof notice !== 'string' || notice.trim().length > 32) {
      return false;
    }

    account.notice = notice;
    this.saveAccount(account);
    return true;
  }

  addAccount(account) {
    const { name, password } = account;
    if (!this.checkName(name) || !this.checkPassword(password)
      || storage.existsFile(name)) {
      return false;
    }
    if (Object.keys(accountMap).length >= MAX_ACCOUNT_COUNT) {
      return false;
    }
    account = {
      name,
      password: shasum(password),
      active: true,
      envList: [],
    };
    this.saveAccount(account);
    this.parseRules();
    return true;
  }

  moveAccount(fromName, toName) {
    return storage.moveTo(fromName, toName);
  }

  removeAccount(name) {
    const account = this.getAccount(name);
    if (account) {
      delete accountMap[name];
      storage.removeFile(name);
    }
    this.parseRules();
    return true;
  }

  activeAccount(name, active) {
    const account = this.getAccount(name);
    if (!account) {
      return false;
    }
    account.active = active;
    this.saveAccount(account);
    this.parseRules();
    return true;
  }

  saveAccount(account) {
    storage.writeFile(account.name, JSON.stringify(account));
  }

  getAccount(name) {
    return this.checkName(name) ? accountMap[name] : null;
  }

  getRules(name, envName) {
    return this.parsedMap[`${name}/${envName}`] || '';
  }

  getAllAccounts() {
    const accountList = [];
    this.loadAllAccounts().forEach((account) => {
      account = this.getAccount(account.name);
      if (account) {
        accountList.push({
          name: account.name,
          active: account.active,
          notice: account.notice,
        });
      }
    });
    return accountList;
  }

  getAccountList(parsed) {
    const list = [];
    const { parsedMap } = this;
    this.loadAllAccounts().forEach((account) => {
      const accountName = account.name;
      account = this.getAccount(accountName);
      if (!account || !account.active) {
        return;
      }
      const envList = [];
      account.envList.forEach(({ name, rules }) => {
        if (!name) {
          return;
        }
        if (parsed === '1') {
          rules = parsedMap[`${accountName}/${name}`];
        } else if (parsed !== '0') {
          rules = undefined;
        }
        envList.push({
          name,
          id: encodeURIComponent(name),
          rules,
        });
      });
      list.push({
        name: accountName,
        active: account.active,
        notice: account.notice,
        envList,
      });
    });
    return list;
  }

  getAuthKey() {
    return storage.getProperty('authKey') || '';
  }

  setAuthKey(authKey) {
    authKey = authKey || '';
    if (!AUTH_KEY_RE.test(authKey)) {
      return;
    }
    storage.setProperty('authKey', authKey);
  }

  setDefaultAuthKey(key) {
    this.defaultAuthKey = AUTH_KEY_RE.test(key) ? key : null;
  }

  setDomain(domain) {
    domainList = parseDomain(domain);
  }

  getDomainList() {
    return domainList;
  }

  getBaseUrl() {
    const domain = domainList[0] || getServerIp();
    if (domain) {
      return `${domain}:${port}`;
    }
    return 'local.whistlejs.com/plugin.nohost';
  }
}

module.exports = (options) => {
  storage = options.storage;
  port = options.data.realPort;
  const { getCustomCertsInfo } = options;
  const accountMgr = new AccountMgr();
  accountMgr.setDomain(options.data.domain);
  (function loadCerts() {
    getCustomCertsInfo((certs) => {
      if (certs) {
        // 如果更新证书会重启整个服务，所以无需一直轮询调用
        certsDomain = Object.keys(certs);
        accountMgr.parsePatterns();
      } else {
        setTimeout(loadCerts, 1000);
      }
    });
  }());
  accountMgr.storageServer = options.data.storageServer;
  accountMgr.dnsServer = options.data.dnsServer;
  accountMgr.accountPluginPath = options.data.accountPluginPath;
  accountMgr.setDefaultAuthKey(options.data.authKey);
  module.exports = accountMgr;
  return accountMgr;
};
