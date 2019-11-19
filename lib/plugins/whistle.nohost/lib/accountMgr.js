const getValue = require('lodash.get');
const { isIP } = require('net');
const util = require('./util');
const { getServerIp } = require('../../../util/address');

const { parseJSON, shasum } = util;
const MAX_ACCOUNT_COUNT = 120;
const MAX_PASSWORD_LENGTH = 24;
const KEY_RE = /^@([\w.-]{1,64})(\/[^\s]+)?$/mg;
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

let port = 8080;
let accoutMap;
let storage;
let certsDomain;
let baseUrl;

const trimRules = (rules) => {
  return rules.trim().replace(VALUE_RE, all => (all[0] === '#' ? '' : all)).replace(CRLF_RE, '\n');
};

const parseRule = (rules, defaultRules, testRules, varRegExp, keyValueMap) => {
  const headers = {};
  rules = trimRules(rules).replace(CONFIG_RE, (_, key, value) => {
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
  rules = [rules];
  if (testRules && env !== 'prod' && env !== 'production' && Object.keys(headers).length) {
    rules.push(testRules);
  }
  if (defaultRules) {
    rules.push(defaultRules);
  }
  rules = trimRules(rules.join('\n'));
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

const sortor = (cur, next) => {
  if (cur.index === next.index) {
    return 0;
  }
  return cur.index > next.index ? -1 : 1;
};

const parseEntryPatterns = (str) => {
  const patterns = [];
  const rawPatterns = str.trim().split(/\s+/).map((pattern) => {
    let index = 0;
    if (INDEX_RE.test(pattern)) {
      index = parseInt(RegExp.$1, 10);
      pattern = pattern.substring(pattern.indexOf(')') + 1);
      if (!pattern) {
        return;
      }
    }
    if (pattern[0] === '_') {
      pattern = pattern.substring(1);
      if (pattern) {
        patterns.push({ pattern, index });
      }
    } else if (pattern[0] === '#') {
      pattern = pattern.substring(1);
      if (pattern) {
        patterns.push({ pattern, index, ignore: true });
      }
    } else if (!patterns.includes(pattern)) {
      patterns.push({ pattern, index, button: true });
    }
    return pattern;
  });
  if (certsDomain) {
    certsDomain.forEach((domain) => {
      if (!rawPatterns.includes(domain)) {
        patterns.push({ pattern: domain, index: 0, button: true });
      }
    });
  }
  patterns.sort(sortor);
  const entryRules = patterns.map((item) => {
    return `${item.pattern} whistle.nohost://${item.button ? '' : 'none'}`;
  }).join('\n');
  return {
    patterns,
    entryRules,
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
    return !!storage.getProperty('enableGuest');
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
    } = parseEntryPatterns(entryPatterns);
    this.entryRules = entryRules;
    this.patterns = patterns;
  }

  parseRules() {
    const result = {};
    const accountList = this.loadAllAccounts();
    const list = [];
    const rulesTpl = getStringProperty('rulesTpl');
    let defaultRules = getStringProperty('defaultRules');
    let testRules = getStringProperty('testRules');
    this.rulesTpl = rulesTpl;
    this.pureRulesTpl = trimRules(rulesTpl);
    this.defaultRules = defaultRules;
    this.testRules = testRules;
    this.parsedMap = {};
    accoutMap = {};
    accountList.forEach((account) => {
      const { name, envList, active } = account;
      accoutMap[name] = account;
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
      const { key, rules } = env;
      if (!rules) {
        return;
      }
      result[key] = trimRules(rules).replace(KEY_RE, (all, name, envName) => {
        envName = envName && envName.slice(1);
        if (!envName) {
          return this.parseTpl(name);
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
    list.forEach((env) => {
      this.parsedMap[env.key] = parseRule(env.rules, defaultRules, testRules, this.varRegExp, this.keyValueMap);
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
    storage.getFileList().some((file) => {
      const account = parseJSON(file.data);
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

  addAccount(account) {
    const { name, password } = account;
    if (!this.checkName(name) || !this.checkPassword(password)
      || storage.existsFile(name)) {
      return false;
    }
    if (Object.keys(accoutMap).length >= MAX_ACCOUNT_COUNT) {
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
      delete accoutMap[name];
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
    return this.checkName(name) ? accoutMap[name] : null;
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

  setBaseUrl(url) {
    baseUrl = (!url || isIP(url)) ? '' : url;
    this.parsePatterns();
  }

  getBaseUrl() {
    const domain = baseUrl || getServerIp();
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
  accountMgr.setBaseUrl(options.data.baseUrl);
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
  module.exports = accountMgr;
  return accountMgr;
};
