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

exports.remove = (name) => {
  name = path.join(CUSTOM_CERTS_DIR, name);
  return new Promise((resolve, reject) => {
    fs.unlink(name, err => (err ? reject(err) : resolve));
  });
};

exports.list = () => {

};
