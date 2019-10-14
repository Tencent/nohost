const { passThrough, isLocalHost } = require('./util');
const handleRequest = require('./uiServer');

module.exports = (req, res) => {
  if (isLocalHost(req)) {
    handleRequest(req, res);
  } else {
    passThrough(req, res);
  }
};
