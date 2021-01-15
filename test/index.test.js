const startServer = require('../index');

const options = {
  debugMode:'product',
};

const cb = jest.fn();

describe('index', ()=>{
    test('should callback be called',()=>{
      expect(startServer(options, cb)).toBeUndefined();
    });
});



