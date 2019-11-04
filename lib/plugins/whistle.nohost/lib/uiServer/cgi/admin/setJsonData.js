module.exports = (ctx) => {
  const { jsonData } = ctx.request.body;
  ctx.accountMgr.setJsonData(jsonData);
  ctx.body = { ec: 0 };
};
