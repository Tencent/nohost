const path = require('path');
const os = require('os');
const fs = require('fs');
const fse = require('fs-extra');

const PLUGINS_DIR = path.resolve(os.homedir(), 'whistle-plugins/whistle.nohost');
const WHISTLE_PLUGIN_RE = /^(@[\w-]+\/)?whistle\.[a-z\d_-]+$/;
const ACCOUNT_RE = /^[\w.-]{1,24}$/;

const getAccount = (argv) => {
  let account;
  for (let i = 0, len = argv.length; i < len; i++) {
    const arg = argv[i];
    if (['-a', '-w', '--account'].indexOf(arg) !== -1) {
      account = argv[i + 1];
      argv.splice(i, 2);
      break;
    }
    if (/^--account=/.test(arg)) {
      account = arg.substring(10);
      break;
    }
  }
  return account && ACCOUNT_RE.test(account) ? account : null;
};

const parseArgv = (argv) => {
  argv = argv.slice();
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
