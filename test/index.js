const startServer = require('../index');

startServer(function() {
  console.log(`nohost is listening on ${this.address().port}`);
});
