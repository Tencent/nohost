const os = require('os');
const path = require('path');

const USERNAME_RE = /^[a-z\d.]{1,64}$/;
const DATE_RE = /^\d{8}$/;
const leftPad = num => (num > 9 ? num : `0${num}`);
let nohostPath;

const getSessionsPath = () => {
  nohostPath = nohostPath || process.env.NOHOST_PATH || path.join(os.homedir(), '.NohostAppData');
  return nohostPath;
};

const getDate = () => {
  const now = new Date();
  return `${now.getFullYear()}${leftPad(now.getMonth() + 1)}${leftPad(now.getDate())}`;
};

exports.getDate = getDate;

exports.getSessionsDir = (username, date) => {
  if (typeof username !== 'string' || !USERNAME_RE.test(username) || !DATE_RE.test(date)) {
    return;
  }
  const dir = getSessionsPath(date);
  return username ? path.join(dir, username, date) : path.join(dir, date);
};
