const $ = require('jquery');

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
