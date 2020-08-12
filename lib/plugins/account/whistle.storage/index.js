
const { Pool } = require('socketx');
const { encode } = require('simpleproto');
const crc23 = require('crc32');

const UID_RE = /^[\w.-]{1,64}$/;

exports.uiServer = (server, { data: { storageServer } }) => {
  const len = storageServer && storageServer.length;
  const rules = len ? '* whistle.storage:// includeFilter://reqH:x-whistle-nohost-storage-uid=/^[\\w.-]{1,64}$/' : '';
  server.on('request', (_, res) => {
    res.end(rules);
  });
};

exports.resStatsServer = (server, { data: { storageServer } }) => {
  const len = storageServer && storageServer.length;
  if (!len) {
    return;
  }
  const pool = new Pool();
  storageServer.forEach((opt) => {
    opt.idleTimeout = 30000;
  });
  server.on('request', (req) => {
    req.getSession(async (s) => {
      if (s) {
        const uid = s.req.headers['x-whistle-nohost-storage-uid'];
        if (!uid || !UID_RE.test(uid)) {
          return;
        }
        const index = len > 1 ? (parseInt(crc23(uid), 16) % len) : 0;
        try {
          const socket = await pool.connect(storageServer[index]);
          socket.write(encode(s));
        } catch (e) {}
      }
    });
  });
};
