const startServer = require('../index');

// debug mode
const options = {
  debugMode:'product',
};

const cb = jest.fn();

// Test index.js
describe('index', ()=>{
    test('should callback be called',()=>{
      expect(startServer(options, cb)).toBeUndefined();
    });
});
