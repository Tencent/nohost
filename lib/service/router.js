const exportSessions = require('./cgi/export');
const importSessions = require('./cgi/import');

module.exports = (router) => {
  router.post('/cgi-bin/sessions/export', exportSessions);
  router.get('/cgi-bin/sessions/import', importSessions);
};
