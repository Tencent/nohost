const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const Limiter = require('async-limiter');
const { gzip } = require('zlib');
const { getSessionsDir, getDate, getAccessCode } = require('./util');

const promises = {};
const limiter = new Limiter({ concurrency: 10 });
const ROUTE_RE = /^[\w.:/=+-]{1,100}$/;

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
  let { query: { username, route }, body: { name, sessions, code } } = ctx.request;
  if (!name || !sessions || typeof sessions !== 'string') {
    return;
  }
  code = getAccessCode(code);
  const date = getDate();
  const dir = getSessionsDir(username, date, code);
  if (!dir) {
    return;
  }
  await createDir(dir);
  try {
    sessions = await compressSessions(sessions);
    name = encodeURIComponent(name);
    if (code) {
      name = `${name}[${code}]`;
    }
    await writeFile(path.join(dir, `${name}[gz]`), sessions);
    ctx.body = { ec: 0, date, username, route: route && ROUTE_RE.test(route) ? route : undefined };
  } catch (e) {
    ctx.body = { ec: e.code === 'EEXIST' ? 1 : 2 };
  }
  if (ctx.get('origin')) {
    ctx.set('Access-Control-Allow-Origin', '*');
  }
};
