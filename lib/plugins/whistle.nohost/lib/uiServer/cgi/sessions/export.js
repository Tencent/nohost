const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const { getSessionsDir, getDate } = require('./util');

const promises = {};

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

const createDir = (dir) => {
  let p = promises[dir];
  if (!p) {
    p = fse.ensureDir(dir);
    promises[dir] = p;
  }
  return p;
};

module.exports = async (ctx) => {
  const { query: { username }, body: { name, sessions } } = ctx.request;
  if (!name || !sessions || typeof sessions !== 'string') {
    ctx.body = { ec: 2 };
    return;
  }
  const date = getDate();
  const dir = getSessionsDir(username, date);
  if (!dir) {
    ctx.body = { ec: 2 };
    return;
  }
  await createDir(dir);
  try {
    await writeFile(path.join(dir, encodeURIComponent(name)), sessions);
    ctx.body = { ec: 0, date };
  } catch (e) {
    ctx.body = { ec: e.code === 'EEXIST' ? 1 : 2 };
  }
  if (ctx.get('origin')) {
    ctx.set('Access-Control-Allow-Origin', '*');
  }
};
