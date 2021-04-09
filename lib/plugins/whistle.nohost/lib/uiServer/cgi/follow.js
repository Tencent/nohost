
const net = require('net');

module.exports = (ctx) => {
  const { followIp } = ctx.request.query;
  if (net.isIP(followIp)) {
    const { success, errMsg } = ctx.envMgr.setFollower(followIp, ctx);
    const msg = success ? '设置成功，<a href="./">点击调整到选择环境页面</a>' : `设置失败，${errMsg}`;
    ctx.type = 'html';
    ctx.body = `<p style="text-align: center; padding: 20px 0;">${msg}</p>`;
    return;
  }
  ctx.body = {
    ec: 0,
    clientIp: ctx.ip,
    followerIp: ctx.envMgr.getFollower(ctx),
  };
};
