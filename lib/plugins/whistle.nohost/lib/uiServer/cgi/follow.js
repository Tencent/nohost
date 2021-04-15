
const { getClientId, isClientId } = require('../../util');

module.exports = (ctx) => {
  const { followIp } = ctx.request.query;
  if (isClientId(followIp)) {
    ctx.envMgr.setFollower(followIp, ctx);
    ctx.type = 'html';
    ctx.body = '<p style="text-align: center; padding: 20px 0;">设置成功，<a href="./">点击调整到选择环境页面</a></p>';
    return;
  }
  ctx.body = {
    ec: 0,
    clientIp: getClientId(ctx),
    followerIp: ctx.envMgr.getFollower(ctx),
  };
};
