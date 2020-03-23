const fs = require('fs');
const path = require('path');
const { getSessionsDir } = require('./util');

module.exports = (ctx) => {
  const { username, name, date } = ctx.request.query;
  if (!name || typeof name !== 'string') {
    return;
  }
  const dir = getSessionsDir(username, date);
  if (!dir) {
    return;
  }
  ctx.body = fs.createReadStream(path.join(dir, encodeURIComponent(name)));
};
