/* Tencent is pleased to support the open source community by making nohost-环境配置与抓包调试平台 available.
* Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved. The below software in
* this distribution may have been modified by THL A29 Limited ("Tencent Modifications").
* All Tencent Modifications are Copyright (C) THL A29 Limited.
* nohost-环境配置与抓包调试平台 is licensed under the MIT License except for the third-party components listed below.
*/

const startServer = require('../index');

// debug mode
const options = {
  debugMode: 'product',
};

const cb = jest.fn();

// Test index.js
describe('index', () => {
  test('should callback be called', () => {
    expect(startServer(options, cb)).toBeUndefined();
  });
});
