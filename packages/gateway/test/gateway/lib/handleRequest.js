const auth = require('./auth');

module.exports = async (req/* , res */) => {
  const result = await auth(req);
  return result || {
    host: '127.0.0.1',
    port: 8899,
    resRulesUrl: 'http://127.0.0.1:7003',
  };
};
