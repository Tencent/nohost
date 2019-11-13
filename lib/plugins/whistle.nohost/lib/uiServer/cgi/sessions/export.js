const fs = require('fs');
const path = require('path');
const { getDate, getNohostPath } = require('./util');

const MAX_LEN = 26;

const writeFile = (filepath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, data, {
      flag: 'wx',
    }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = async (ctx) => {
  const { name, sessions } = ctx.request.body;
  if (!name || !sessions
    || typeof name !== 'string'
    || typeof sessions !== 'string'
    || name.length > MAX_LEN) {
    ctx.body = { ec: 2 };
    return;
  }
  const date = getDate();
  const nohostPath = getNohostPath(date, true);
  const filepath = path.join(nohostPath, encodeURIComponent(name));
  try {
    await writeFile(filepath, sessions);
    ctx.body = { ec: 0, date };
  } catch (e) {
    ctx.body = { ec: e.code === 'EEXIST' ? 1 : 2 };
  }
  if (ctx.get('origin')) {
    ctx.set('Access-Control-Allow-Origin', '*');
  }
};
