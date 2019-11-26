const os = require('os');
const net = require('net');

const LOCALHOST = '127.0.0.1';
let addressList = [];
let serverIp;

(function updateSystyemInfo() {
  const interfaces = os.networkInterfaces();
  addressList = [];
  Object.keys(interfaces).forEach((name) => {
    const list = interfaces[name];
    if (Array.isArray(list)) {
      list.forEach((info) => {
        if (!info.internal && info.family === 'IPv4') {
          serverIp = info.address;
        }
        addressList.push(info.address.toLowerCase());
      });
    }
  });
  setTimeout(updateSystyemInfo, 30000);
}());

exports.getAddressList = () => addressList;

const isLocalHost = (ip) => {
  if (!ip || typeof ip !== 'string') {
    return true;
  }
  return ip.length < 7 || ip === LOCALHOST;
};

const isLocalAddress = (address) => {
  if (!net.isIP(address)) {
    return;
  }
  if (isLocalHost(address)) {
    return true;
  }
  if (address === '0:0:0:0:0:0:0:1') {
    return true;
  }
  address = address.toLowerCase();
  if (address[0] === '[') {
    address = address.slice(1, -1);
  }
  return addressList.indexOf(address) !== -1;
};

exports.isLocalAddress = isLocalAddress;

exports.getServerIp = () => serverIp;
