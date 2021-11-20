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
  setAccountRules,
  setDefaultRules,
  setAuthKey,
  getAuthKey,
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
    url: 'cgi-bin/list?parsed=1&notice=1',
    mode: 'cancel',
  },
  loadSettings: 'cgi-bin/admin/get-settings',
  getAuthKey: 'cgi-bin/admin/get-auth-key',
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
  setAccountRules: {
    url: 'cgi-bin/admin/set-account-rules',
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
    url: 'cgi-bin/certs/upload?dataType=parsed',
    contentType: 'application/json;charset=utf8',
    type: 'post',
  },
  getCertsInfo: 'cgi-bin/get-custom-certs-info',
  removeCert: {
    url: '/cgi-bin/certs/remove?dataType=parsed',
    contentType: 'application/json;charset=utf8',
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
  let count = 2;
  let authData;
  let settings;
  let handleCb = null;
  const loadData = () => {
    if (authData) {
      handleCb();
    } else {
      getAuthKey((data) => {
        authData = data;
        handleCb();
      });
    }
    if (settings) {
      handleCb();
    } else {
      getAdminSettings((data) => {
        settings = data;
        handleCb();
      });
    }
  };
  handleCb = () => {
    if (--count > 0) {
      return;
    }
    if (!authData || !settings) {
      count = 2;
      setTimeout(loadData, 1000);
      return;
    }
    settings.authKey = authData.authKey;
    cb(settings);
  };
  loadData();
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
  setAccountRules,
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
