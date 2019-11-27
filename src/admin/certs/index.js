import './index.css';
import React, { Component } from 'react';
import { Table, Icon, Button, message, Popconfirm } from 'antd';
import { uploadCerts, getCertsInfo, removeCert } from '../cgi';

const HIGHLIGHT = { color: 'red', fontWeight: 'bold' };
const OK_STYLE = { color: '#5bbd72', fontSize: '22px', fontWeight: 'bold', overflow: 'hide', lineHeight: '18px' };

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
      resolve(reader.result);
    };
  });
}

function parseCerts(data) {
  const files = {};
  let invalidList;
  Object.keys(data).forEach((domain) => {
    const cert = data[domain];
    const startDate = new Date(cert.notBefore);
    const endDate = new Date(cert.notAfter);
    let status = '✓';
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
        mtime: cert.mtime,
        domain: [cert.domain],
        validity: `${startDate.toLocaleString()} ~ ${endDate.toLocaleString()}`,
        status,
        isInvalid,
      };
      files[filename] = item;
      if (isInvalid) {
        invalidList = invalidList || [];
        invalidList.push(filename);
      }
    } else {
      item.domain.push(cert.domain);
    }
  });
  return {
    data: Object.keys(files).sort((a, b) => {
      return files[a].mtime > files[b].mtime ? -1 : 1;
    }).map(file => {
      file = files[file];
      file.domain = file.domain.join(', ');
      return file;
    }),
    invalidList,
  };
}


// eslint-disable-next-line react/prefer-stateless-function
class Certs extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.columns = [
      {
        title: '文件名称',
        dataIndex: 'filename',
        key: 'filename',
        width: 270,
        render: (_, record) => {
          return <span style={record.status !== '✓' ? HIGHLIGHT : null}>{record.filename}</span>;
        },
      },
      {
        title: '域名列表',
        dataIndex: 'domain',
        key: 'domain',
        render: (_, record) => {
          return <span style={record.status !== '✓' ? HIGHLIGHT : null}>{record.domain}</span>;
        },
      },
      {
        title: '有效期',
        dataIndex: 'validity',
        key: 'validity',
        width: 380,
        render: (_, record) => {
          return <span style={record.status !== '✓' ? HIGHLIGHT : null}>{record.validity}</span>;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (_, record) => {
          return <span style={record.status !== '✓' ? HIGHLIGHT : OK_STYLE}>{record.status}</span>;
        },
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 150,
        render: (_, record) => {
          return (
            <Popconfirm
              title={`确定删除证书 "${record.filename}" ？`}
              onConfirm={() => this.removeCert(record.filename)}
            >
              <a>删除</a>
            </Popconfirm>
          );
        },
      },
    ];
  }


  componentDidMount() {
    this.updateCertsInfo();
  }

  removeCert = (filename) => {
    removeCert(JSON.stringify({ filename }), (data) => {
      if (!data) {
        return message.error('操作异常，请稍后重试！');
      }
      this.updateCertsInfo();
    });
  }

  updateCertsInfo = () => {
    getCertsInfo((data) => {
      if (!data) {
        return message.error('证书加载失败，请求稍后重试!');
      }
      this.setState(parseCerts(data));
    });
  }

  clearAllInvalidCerts = () => {
    removeCert(JSON.stringify({ filename: this.state.invalidList }), (data) => {
      if (!data) {
        return message.error('操作异常，请稍后重试！');
      }
      this.updateCertsInfo();
    });
  }

  formatFiles = (fileList = []) => {
    let certs;
    for (let i = 0, len = fileList.length; i < len; i++) {
      const cert = fileList[i];
      if (cert.size > 10 * 1024 || !(cert.size > 0)) {
        message.error('上传的证书过大，请上传10K以内的证书！');
        return;
      }
      let { name } = cert;
      if (!/\.(crt|key)/.test(name)) {
        message.error('只支持 .key 或 .crt 后缀的文件！');
        return;
      }
      const suffix = RegExp.$1;
      name = name.slice(0, -4);
      if (!name || /[^\w*.-]/.test(name)) {
        message.error('证书名称存在非法字符！');
        return;
      }
      certs = certs || {};
      const pair = certs[name] || [];
      pair[suffix === 'key' ? 0 : 1] = cert;
      certs[name] = pair;
    }
    if (!certs) {
      return;
    }
    const badCert = Object.values(certs).find((list) => {
      return !list[0] || !list[1];
    });
    if (badCert) {
      message.error('上传的 key 文件和 crt 文件的不匹配，请检查后重新上传！');
      return;
    }
    return certs;
  }


  handleChange = () => {
    const input = document.getElementById('upload-input');
    const files = this.formatFiles(input.files);
    if (!files) {
      return;
    }
    const pendingList = Object.keys(files).map((name) => {
      return Promise.all(files[name].map(readFile)).then((result) => {
        files[name] = result;
      });
    });

    Promise.all(pendingList).then(() => {
      uploadCerts(JSON.stringify(files), (data) => {
        if (data.ec === 0) {
          message.success('上传成功');
          this.updateCertsInfo();
        } else {
          message.error('上传失败，请稍后重试！');
        }
      });
    }, () => {
      message.error('上传失败，请稍后重试！');
    });
    input.value = '';
  };

  render() {
    const { hide } = this.props;

    return (
      <div className={`fill vbox p-certs${hide ? ' p-hide' : ''}`}>
        <div className="p-action-bar">
          {
            this.state.invalidList ? (
              <Popconfirm
                title="确定清除所有不可用证书？"
                onConfirm={this.clearAllInvalidCerts}
              >
                <Button type="danger" className="p-clear-valid-certs">一键清除不可用证书</Button>
              </Popconfirm>
            ) : null
          }
          <div className="upload-wrapper">
            <input id="upload-input" type="file" accept=".crt,.key" multiple="multiple" onChange={this.handleChange} />
            <Button className="upload-btn" type="primary"><Icon type="upload" />上传证书</Button>
          </div>
        </div>
        <div className="fill p-content">
          <Table columns={this.columns} dataSource={this.state.data} pagination={false} />
        </div>
      </div>
    );
  }
}

export default Certs;
