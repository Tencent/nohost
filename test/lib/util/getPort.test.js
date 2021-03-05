const getPort = require('../../../lib/util/getPort');

let mockPort;

function portCb(port) {
  mockPort = port;
}
jest.mock('http', () => {
  return {
    createServer: () => {
      return {
        listen: (port, host, callback) => { callback(); },
        removeAllListeners: () => true,
        on: () => true,
        close: (callb) => callb(),
      };
    },
  };
});

describe('util getPort', () => {
  test('should server start', () => {
    getPort(portCb);
    expect(mockPort).toBeGreaterThanOrEqual(30013);
  });
});
