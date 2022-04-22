const { createServer } = require('http');
const handleServer = require('./lib');

const PORT = 6001;
const server = createServer();
handleServer(server);
server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}.`); // eslint-disable-line
});
