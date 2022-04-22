const path = require('path');
const startGateway = require('../../index');

const ROOT = path.join(__dirname, 'lib');

startGateway({
  sniCallback: path.join(ROOT, 'sniCallback'),
  handleRequest: path.join(ROOT, 'handleRequest'),
  handleConnect: path.join(ROOT, 'handleConnect'),
  handleUpgrade: path.join(ROOT, 'handleUpgrade'),
  port: 8081,
});
