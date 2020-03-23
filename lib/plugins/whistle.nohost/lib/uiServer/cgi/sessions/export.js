const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const Limiter = require('async-limiter');
const { gzip } = require('zlib');
const { getSessionsDir, getDate } = require('./util');

const promises = {};
const limiter = new Limiter({ concurrency: 10 });

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

const compressSessions = (sessions) => {
  return new Promise((resolve, reject) => {
    limiter.push((done) => {
      gzip(sessions, (err, buf) => {
        done();
        if (err) {
          reject(err);
        } else {
          resolve(buf);
        }
      });
    });
  });
};

module.exports = async (ctx) => {
  let { query: { username }, body: { name, sessions } } = ctx.request;
  if (!name || !sessions || typeof sessions !== 'string') {
    return;
  }
  const date = getDate();
  const dir = getSessionsDir(username, date);
  if (!dir) {
    return;
  }
  await createDir(dir);
  try {
    sessions = await compressSessions(sessions);
    name = `${encodeURIComponent(name)}[gz]`;
    await writeFile(path.join(dir, name), sessions);
    ctx.body = { ec: 0, date, username };
  } catch (e) {
    ctx.body = { ec: e.code === 'EEXIST' ? 1 : 2 };
  }
  if (ctx.get('origin')) {
    ctx.set('Access-Control-Allow-Origin', '*');
  }
};
