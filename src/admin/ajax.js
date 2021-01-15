/**
 * Tencent is pleased to support the open source community by making nohost-环境配置与抓包调试平台 available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved. The below software in
 * this distribution may have been modified by THL A29 Limited ("Tencent Modifications").
 * All Tencent Modifications are Copyright (C) THL A29 Limited.
 * nohost-环境配置与抓包调试平台 is licensed under the MIT License except for the third-party components listed below.
 */

const $ = require('jquery');
// 生成调用后台接口的方法
function createCgi(url, settings) {
  const self = this;
  if (typeof url === 'string') {
    url = { url };
  }
  settings = $.extend({ dataType: 'json' }, settings, url);
  url = url.url;
  const queue = [];
  let jqXhr;

  const cgiFn = function (data, callback, options) {
    const opts = { url: typeof url === 'function' ? url() : url };
    if (typeof data === 'function') {
      options = callback;
      callback = data;
      data = null;
    } else {
      opts.data = data;
    }

    options = $.extend(true, {}, settings, options, opts);
    if (jqXhr) {
      // 处理请求类型
      const { mode } = options;
      if (mode === 'ignore') {
        return;
      }
      if (mode === 'cancel') {
        jqXhr.abort();
      } else if (mode === 'chain') {
        return queue.push([data, callback, options]);
      }
    }

    const execCallback = function (result, xhr) {
      jqXhr = null;
      if (typeof callback === 'function') {
        callback.call(this, result, xhr);
      }
      const args = queue.shift();
      if (args) {
        cgiFn.apply(self, args);
      }
    };
    options.success = function (result, statusText, xhr) {
      execCallback.call(this, result, xhr);
    };
    options.error = function (xhr) {
      execCallback.call(this, false, xhr);
    };

    return (jqXhr = $.ajax(options));
  };

  return cgiFn;
}

export default function (obj, settings) {
  const cgi = {};
  Object.keys(obj).forEach((name) => {
    cgi[name] = createCgi(obj[name], settings);
  });
  return cgi;
}
