const path = require('path');
const fs = require('fs');

const filePath = path.join(process.cwd(),'test/app/assets');
const certPath = path.join(filePath,'custom_certs');
process.env.WHISTLE_PATH = filePath;

const {write, remove} =  require('../../../lib/main/certsMgr');

const certName = 'file1.crt';
const keyName = 'file1.key';
const writeCrt = write(certName, '213');
const writeKey =  write(keyName, '213');

describe('lib main certsMgr', () => {
  test('write file and read file content', () => {

    try{
      Promise.all([writeCrt,writeKey]).then(() => {
        const content = fs.readFileSync(path.join(certPath,certName));
        expect(content.toString()).toBe('213');
      });

    }catch(err){
      console.log(err);
    }
  });

  test('should file not exist while remove', () => {
    const moveName = 'file2';
    const writeCrt = 'file2.crt';
    const writeKey =  'file2.key';
    write(writeCrt, '213');
    write(writeKey, '213');

    Promise.all([writeCrt,writeKey]).then(() => {
      return remove(moveName);
    }).then(()=>{
      const existCrt = fs.existsSync(path.join(certPath,writeCrt));
      const existKey = fs.existsSync(path.join(certPath,writeKey));
      expect(existCrt).toBeFalsy();
      expect(existKey).toBeFalsy();
    });
  });
});