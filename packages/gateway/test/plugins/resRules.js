const { createServer } = require('http');

const server = createServer((req, res) => {
  res.on('error', () => {});
  res.end(JSON.stringify({ rules: '* resHeaders://x-test1=123' }));
});

server.listen(7003);
