const fs = require('fs');
const path = require('path');
const { getDate, getNohostPath } = require('./util');

module.exports = (ctx) => {
  let { name, date } = ctx.request.query;
  if (!name || typeof name !== 'string') {
    ctx.status = 404;
    return;
  }
  date = getDate(date);
  const nohostPath = getNohostPath(date);
  const filepath = path.join(nohostPath, encodeURIComponent(name));
  ctx.body = fs.createReadStream(filepath);
};
