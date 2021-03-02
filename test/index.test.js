/* Tencent is pleased to support the open source community by making nohost-环境配置与抓包调试平台 available.
* Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved. The below software in
* this distribution may have been modified by THL A29 Limited ("Tencent Modifications").
* All Tencent Modifications are Copyright (C) THL A29 Limited.
* nohost-环境配置与抓包调试平台 is licensed under the MIT License except for the third-party components listed below.
*/
const startServer = require('../index');
const { httpRequire } = require('./utils');

// debug mode
const options = {
  port: 9001,
  debugMode: 'product',
};

const cb = jest.fn();

// Test index.js
describe('index', () => {
  test('9001 port', () => {
    expect(startServer(options, cb)).toBeUndefined();
  });

  test('9002 port', () => {
    options.port = 9002;
    options.mode = 'prod';
    expect(startServer(options, cb)).toBeUndefined();
  });

  test('option is function', () => {
    expect(startServer(cb, '')).toBeUndefined();
  });

  test('should response be matched index html', done => {
    options.port = 3002;
    startServer(options, cb);

    httpRequire('http://127.0.0.1:3002').then(str => {
      expect(str).toContain('选择环境');
      done();
    });
  });

  test('should response be matched share html', done => {
    options.port = 3003;
    startServer(options, cb);

    httpRequire('http://127.0.0.1:3003/account/sda/share/').then(str => {
      expect(str).toContain('查看抓包');
      done();
    });
  });

  test('should response be matched export html', done => {
    options.port = 3004;
    startServer(options, cb);

    httpRequire('http://127.0.0.1:3004/export_sessions').then(str => {
      expect(str).toContain('Method Not Allowed');
      done();
    });
  });

  test('should response be matched export html', done => {
    options.port = 3005;
    startServer(options, cb);
    httpRequire('http://127.0.0.1:3005/nohost_share/').then(str => {
      expect(str).toContain('查看抓包');
      done();
    });
  });
});
