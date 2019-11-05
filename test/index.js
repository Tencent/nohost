const startServer = require('../index');

startServer(function() {
  console.log(`punk is listening on ${this.address().port}`)
});
