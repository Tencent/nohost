const login = require('../../../../lib/main/cgi/login');

const storage = {
  latestVersion: '1.0.0',
  getAdmin: () => {
    return {
      username: 'admin',
      password: '7c4a8d09ca3762af61e59520943dc26494f8941b',
    };
  },
};

const userrInfo ={
  nameKey: 'admin',
  authKey: '3ef9bf2e56995e386a026b29fa514e32234a5d8a',
};

const cookies = {
  get: name => userrInfo[name],
  set: key => key,
};

const ctx = {
  cookies,
  req: {
    headers: {
      authorization: 'Basic YWRtaW46MTIzNDU2',
    }
  },
  set: name => name,
  storage,
};

describe('main cgi getVersion', () => {
  const faildCb = jest.fn();
  const succCb = jest.fn();

  test('should succCb called with correct account', () =>{
    login(ctx,succCb);
    expect(succCb).toBeCalled();
  })

  test('should faildCb will not be called with wrong account', () => {
    storage.getAdmin = () => {
      return {
        username: 'admin2',
        password: '7c4a8d09ca3762af61e59520943dc26494f8941b',
      }
    };

    login(ctx,succCb);
    expect(faildCb).toHaveBeenCalledTimes(0);
  })
})