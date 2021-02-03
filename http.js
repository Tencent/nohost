const http = require('http');

const Koa = require('koa');


const app = new Koa();

http.createServer(app).listen(80, () => {
  const options = {
    path: '/',
    method: 'GET',
    agent: null,
  };

  const req = http.request(options, res => {
    console.log(21232);
  });
  req.on('error', (e) => {
    console.log(`Got error: ${e.message}`);
  });

  req.end();
});
