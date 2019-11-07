import './index.css';
import React, { Component } from 'react';
import { Table, Icon, Button, message } from 'antd';
import { uploadCerts, getCertsInfo } from '../cgi';

const columns = [
  {
    title: '文件名称',
    dataIndex: 'filename',
    key: 'filename',
    width: 270,
    render: text => <a>{text}</a>,
  },
  {
    title: '域名列表',
    dataIndex: 'domain',
    key: 'domain',
  },
  {
    title: '有效期',
    dataIndex: 'validity',
    key: 'validity',
    width: 380,
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 150,
  },
];

function parseCerts(data) {
  const files = {};
  Object.keys(data).forEach((domain) => {
    const cert = data[domain];
    const startDate = new Date(cert.notBefore);
    const endDate = new Date(cert.notAfter);
    let status = 'OK';
    const now = Date.now();
    let isInvalid;
    if (startDate.getTime() > now) {
      isInvalid = true;
      status = 'Invalid';
    } else if (endDate.getTime() < now) {
      isInvalid = true;
      status = 'Expired';
    }
    const { filename } = cert;
    let item = files[filename];
    if (!item) {
      item = {
        key: filename,
        filename,
        domain: [cert.domain],
        validity: `${startDate.toLocaleString()} ~ ${endDate.toLocaleString()}`,
        status,
        isInvalid,
      };
      files[filename] = item;
    } else {
      item.domain.push(cert.domain);
    }
  });
  return Object.keys(files).sort((a, b) => {
    return a > b ? 1 : -1;
  }).map(file => {
    file = files[file];
    file.domain = file.domain.join(', ');
    return file;
  });
}


// eslint-disable-next-line react/prefer-stateless-function
class Certs extends Component {
  state = {}

  componentDidMount() {
    this.updateCertsInfo();
  }

  updateCertsInfo = () => {
    getCertsInfo((data) => {
      if (!data) {
        return message.error('证书加载失败，请求稍后重试!');
      }
      this.setState({ data: parseCerts(data) });
    });
  }

  checkFiles = (fileList = []) => {
    const certObj = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const cert of fileList) {
      if (cert.size > 10 * 1024) {
        message.error('上传的证书过大，请上传10K以内的证书！');
        return false;
      }

      // 上传的crt证书和key证书需要成对存在
      const { name } = cert;
      const crtCert = name.match(/(.+)\.crt/);
      const keyCert = name.match(/(.+)\.key/);
      if (crtCert) {
        const trueName = crtCert[1];
        certObj[trueName] = certObj[trueName] ? certObj[trueName] + 1 : 1;
      } else if (keyCert) {
        const trueName = keyCert[1];
        certObj[trueName] = certObj[trueName] ? certObj[trueName] - 1 : -1;
      }
    }
    if (Object.values(certObj).filter((cnt) => cnt !== 0).length) {
      message.error('上传的crt证书和key证书的数量不一致，请检查后重新上传！');
      return false;
    }
    return true;
  }


  handleChange = () => {
    const { files } = document.getElementById('upload-input');
    if (this.checkFiles(files)) {
      const fileArr = [];
      Object.keys(files).map(index => {
        fileArr.push(new Promise((resolve, reject) => { // 可能删除多行
          try {
            const file = files[index];
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function() {
              resolve({
                content: reader.result,
                name: file.name,
              });
            };
          } catch (err) {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject(err);
          }
        }));
      });

      Promise.all(fileArr).then((list) => {
        uploadCerts(JSON.stringify(list), (data) => {
          if (data.ec === 0) {
            message.success('上传成功');
          } else {
            message.error('上传失败，请稍后重试！');
          }
        });
      }, () => {
        message.error('上传失败，请稍后重试！');
      });
    }
  };

  render() {
    const { hide } = this.props;

    return (
      <div className={`fill vbox p-certs${hide ? ' p-hide' : ''}`}>
        <div className="p-action-bar">
          <div className="upload-wrapper">
            <input id="upload-input" type="file" accept=".crt,.key" multiple="multiple" onChange={this.handleChange} />
            <Button className="upload-btn" type="primary"><Icon type="upload" />上传证书</Button>
          </div>
        </div>
        <div className="fill p-content">
          <Table columns={columns} dataSource={this.state.data} pagination={false} />
        </div>
      </div>
    );
  }
}

export default Certs;
