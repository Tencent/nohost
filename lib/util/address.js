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
        if (!info.internal && (info.family === 'IPv4' || info.family === 4)) {
          serverIp = info.address;
        }
        addressList.push(info.address.toLowerCase());
      });
      // 支持多网卡时，以环境变量指定 serverIp
      const envServerIp = process.env.NOHOST_SERVER_IP;
      if (net.isIP(envServerIp) && addressList.includes(envServerIp)) {
        serverIp = envServerIp;
      }
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
