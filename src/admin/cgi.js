import createCgi from './ajax';

const DEFAULT_CONF = {
  timeout: 16000,
  xhrFields: {
    withCredentials: true,
  },
};

const {
  loadAllAccounts,
  loadSettings,
  setEntryPatterns,
  setJsonData,
  setRulesTpl,
  setTestRules,
  setDefaultRules,
  setAuthKey,
  getFollower,
  unfollow,
  restart,
  getAdminSettings,
  setAdmin,
  setDomain,
  uploadCerts,
  getCertsInfo,
  removeCert,
  enableGuest,
  getVersion,
} = createCgi({
  loadAllAccounts: {
    url: 'cgi-bin/list?parsed=1',
    mode: 'cancel',
  },
  loadSettings: 'cgi-bin/admin/get-settings',
  setEntryPatterns: {
    url: 'cgi-bin/admin/set-entry-patterns',
    type: 'post',
  },
  setJsonData: {
    url: 'cgi-bin/admin/set-json-data',
    type: 'post',
  },
  setRulesTpl: {
    url: 'cgi-bin/admin/set-rules-tpl',
    type: 'post',
  },
  setTestRules: {
    url: 'cgi-bin/admin/set-test-rules',
    type: 'post',
  },
  setDefaultRules: {
    url: 'cgi-bin/admin/set-default-rules',
    type: 'post',
  },
  setAuthKey: {
    url: 'cgi-bin/admin/set-auth-key',
    type: 'post',
  },
  getFollower: {
    url: 'follow',
    mode: 'ignore',
  },
  unfollow: 'unfollow',
  restart: {
    url: 'main/cgi-bin/restart',
    type: 'post',
  },
  getAdminSettings: 'main/cgi-bin/get-settings',
  setAdmin: {
    url: 'main/cgi-bin/set-admin',
    type: 'post',
  },
  setDomain: {
    url: 'main/cgi-bin/set-domain',
    type: 'post',
  },
  uploadCerts: {
    url: 'main/cgi-bin/upload-certs',
    contentType: 'application/json;charset=utf8',
    type: 'post',
  },
  getCertsInfo: 'cgi-bin/get-custom-certs-info',
  removeCert: {
    url: 'main/cgi-bin/remove-cert',
    type: 'post',
  },
  enableGuest: {
    url: 'cgi-bin/admin/enable-guest',
    type: 'post',
  },
  getVersion: 'get-version',
}, DEFAULT_CONF);

const getAllAccounts = (cb) => {
  loadAllAccounts((data) => {
    if (!data) {
      return setTimeout(() => getAllAccounts(cb), 1000);
    }
    cb(data);
  });
};

const getSettings = (cb) => {
  loadSettings((data) => {
    if (!data) {
      return setTimeout(() => getSettings(cb), 1000);
    }
    cb(data);
  });
};

const getAdministratorSettings = (cb) => {
  getAdminSettings((data) => {
    if (!data) {
      return setTimeout(() => getAdministratorSettings(cb), 1000);
    }
    cb(data);
  });
};

const {
  importSessions,
  exportSessions,
} = createCgi({
  exportSessions: {
    type: 'post',
    url: 'cgi-bin/sessions/export',
  },
  importSessions: 'cgi-bin/sessions/import',
}, DEFAULT_CONF);

export {
  getAllAccounts,
  importSessions,
  exportSessions,
  getSettings,
  setEntryPatterns,
  setJsonData,
  setRulesTpl,
  setTestRules,
  setDefaultRules,
  setAuthKey,
  getFollower,
  unfollow,
  restart,
  getAdministratorSettings,
  setAdmin,
  setDomain,
  uploadCerts,
  getCertsInfo,
  removeCert,
  enableGuest,
  getVersion,
};
