const path = require('path');

const USERNAME_RE = /^[a-z\d.]{1,64}$/;
const DATE_RE = /^\d{8}$/;
const ACCESS_CODE_RE = /^[a-z\d]{4}$/i;
const leftPad = num => (num > 9 ? num : `0${num}`);

const getDate = () => {
  const now = new Date();
  return `${now.getFullYear()}${leftPad(now.getMonth() + 1)}${leftPad(now.getDate())}`;
};

exports.getDate = getDate;

const checkUsername = (username) => {
  return username == null || username === '' || (typeof username === 'string' && USERNAME_RE.test(username));
};

exports.getSessionsDir = (username, date, encrypted) => {
  if (!DATE_RE.test(date) || !checkUsername(username)) {
    return;
  }
  const dir = process.env.NOHOST_PATH;
  date = path.join(date, encrypted ? 'encrypted' : 'sessions');
  return username ? path.join(dir, username, date) : path.join(dir, date);
};

exports.getAccessCode = code => (ACCESS_CODE_RE.test(code) ? code.toLowerCase() : '');
