const path = require('path');
const os = require('os');
const fs = require('fs');
const fse = require('fs-extra');

const PLUGINS_DIR = path.resolve(os.homedir(), 'whistle-plugins/whistle.nohost');
const WHISTLE_PLUGIN_RE = /^(@[\w-]+\/)?whistle\.[a-z\d_-]+$/;
const ACCOUNT_RE = /^[\w.-]{1,24}$/;

const getAccount = (argv) => {
  let index = argv.indexOf('-a');
  if (index === -1) {
    index = argv.indexOf('--account');
    if (index === -1) {
      index = argv.indexOf('-w');
    }
  }
  if (index === -1) {
    return;
  }
  const account = argv[index + 1];
  argv.splice(index, 2);
  return ACCOUNT_RE.test(account) ? account : null;
};

const parseArgv = (argv) => {
  const account = getAccount(argv);
  const args = [];
  const plugins = argv.filter((name) => {
    if (WHISTLE_PLUGIN_RE.test(name)) {
      return true;
    }
    args.push(name);
    return false;
  });
  return {
    account,
    plugins,
    args,
  };
};

exports.parseArgv = parseArgv;

const removeDir = (dir) => {
  if (fs.existsSync(dir)) { // eslint-disable-line
    fse.removeSync(dir); // eslint-disable-line
  }
};

exports.uninstall = (argv) => {
  const { account, plugins } = parseArgv(argv);
  if (!plugins.length) {
    return;
  }
  if (account) {
    plugins.forEach((name) => {
      removeDir(path.join(PLUGINS_DIR, account, 'node_modules', name));
      removeDir(path.join(PLUGINS_DIR, account, 'lib/node_modules', name));
    });
  } else {
    plugins.forEach((name) => {
      removeDir(path.join(PLUGINS_DIR, 'node_modules', name));
      removeDir(path.join(PLUGINS_DIR, 'lib/node_modules', name));
    });
  }
};
