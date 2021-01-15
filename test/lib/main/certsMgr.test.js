const path = require('path');
const fs = require('fs');

const filePath = path.join(process.cwd(), 'test/app/assets');
const certPath = path.join(filePath, 'custom_certs');
process.env.WHISTLE_PATH = filePath;

const { write, remove } = require('../../../lib/main/certsMgr');

const certName = 'file1.crt';
const keyName = 'file1.key';
const writeCrt = write(certName, '213');
const writeKey = write(keyName, '213');

describe('lib main certsMgr', () => {
  test('write file and read file content', () => {
    try {
      Promise.all([writeCrt, writeKey]).then(() => {
        const content = fs.readFileSync(path.join(certPath, certName)); // eslint-disable-line
        expect(content.toString()).toBe('213');
      });
    } catch (err) {
      
    }
  });

  test('should file not exist while remove', () => {
    const moveName = 'file2';
    const writeCrt2 = 'file2.crt';
    const writeKey2 = 'file2.key';
    write(writeCrt2, '213');
    write(writeKey2, '213');

    Promise.all([writeCrt, writeKey]).then(() => {
      return remove(moveName);
    }).then(() => {
      const existCrt = fs.existsSync(path.join(certPath, writeCrt2)); // eslint-disable-line
      const existKey = fs.existsSync(path.join(certPath, writeKey2)); // eslint-disable-line
      expect(existCrt).toBeFalsy();
      expect(existKey).toBeFalsy();
    });
  });
});
