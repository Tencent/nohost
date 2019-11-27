const path = require('path');
const fs = require('fs');

const CUSTOM_CERTS_DIR = path.join(process.env.WHISTLE_PATH, 'custom_certs');

exports.write = (name, content) => {
  name = path.join(CUSTOM_CERTS_DIR, name);
  return new Promise((resolve, reject) => {
    fs.writeFile(name, content, err => {
      return err ? reject(err) : resolve();
    });
  });
};

const removeFile = (file) => {
  return new Promise((resolve, reject) => {
    fs.unlink(file, err => (err && err.code !== 'ENOENT' ? reject(err) : resolve()));
  });
};

exports.remove = (name) => {
  const crt = path.join(CUSTOM_CERTS_DIR, `${name}.crt`);
  const key = path.join(CUSTOM_CERTS_DIR, `${name}.key`);
  return Promise.all([removeFile(crt), removeFile(key)]);
};

exports.list = () => {

};
