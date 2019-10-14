const startServer = require('../lib');

startServer(function() {
  console.log(`punk is listening on ${this.address().port}`)
});
