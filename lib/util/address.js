const os = require('os');

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
        // 支持多网卡时，以环境变量指定 serverIp
        if (process.env.NOHOST_SERVER_IP) {
          serverIp = process.env.NOHOST_SERVER_IP;
        } else if (!info.internal && info.family === 'IPv4') {
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
