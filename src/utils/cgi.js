import $ from 'jquery';

function createCgi(url, settings) {
  const self = this;
  if (typeof url === 'string') {
    url = { url };
  }
  settings = $.extend({ dataType: 'json' }, settings, url);
  url = url.url;
  const queue = [];
  let jqXhr;

  function cgiFn(params, callback, options) {
    const opts = { url: typeof url === 'function' ? url() : url };
    if (typeof params === 'function') {
      options = callback;
      callback = params;
      params = null;
    } else {
      opts.data = params;
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
        return queue.push([params, callback, options]);
      }
    }

    const execCallback = function(data, xhr, em) {
      jqXhr = null;
      if (typeof callback === 'function') {
        callback.call(this, data, xhr, em);
      }
      const args = queue.shift();
      if (args) {
        cgiFn.apply(self, args);
      }
    };
    options.success = function(data, statusText, xhr) {
      execCallback.call(this, data, xhr);
    };
    options.error = function(xhr, em) {
      execCallback.call(this, false, xhr, em);
    };

    return (jqXhr = $.ajax(options));
  }

  return cgiFn;
}

function attach(result, obj, settings) {
  Object.keys(obj).forEach((name) => {
    result[name] = createCgi(obj[name], settings);
  });
  return result;
}

function create(obj, settings) {
  return typeof obj === 'string' ? createCgi(obj, settings) : attach({}, obj, settings);
}

export {
  attach,
  create,
};
