const getPort = require('../../../lib/util/getPort');

describe('util getPort', () => {
    
  test('should server start', () => {

    expect(getPort(() => {

    }));
  });

  test('should server error', () => {
      
    expect(getPort(() => {
        
    }));
  });
  
});