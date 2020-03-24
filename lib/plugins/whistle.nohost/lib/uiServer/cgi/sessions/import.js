const fs = require('fs');
const path = require('path');
const { getSessionsDir } = require('./util');

const isGzipFile = (gzFilePath) => {
  return new Promise((resolve) => {
    fs.stat(gzFilePath, (err, stat) => {
      resolve(!err && stat.isFile());
    });
  });
};

module.exports = async (ctx) => {
  let { username, name, date } = ctx.request.query;
  if (!name || typeof name !== 'string') {
    return;
  }
  const dir = getSessionsDir(username, date);
  if (!dir) {
    return;
  }
  name = encodeURIComponent(name);
  const gzFilePath = path.join(dir, `${name}[gz]`);
  const isGFile = await isGzipFile(gzFilePath);
  if (isGFile) {
    ctx.set('content-encoding', 'gzip');
  }
  ctx.body = fs.createReadStream(isGFile ? gzFilePath : path.join(dir, name));
};
