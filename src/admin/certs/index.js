import './index.css';
import React, { Component } from 'react';

import { Table, Switch, Popconfirm, Icon, Button } from 'antd';

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
    dataIndex: 'domains',
    key: 'domains',
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

const data = [
  {
    key: '1',
    enable: <Switch checkedChildren="已启用" unCheckedChildren="已禁用" defaultChecked />,
    name: 'John Brown',
    action: (
      <Popconfirm title="Sure to delete?" onConfirm={(record) => this.handleDelete(record.key)}>
        <a><Icon type="delete" />Delete</a>
      </Popconfirm>
    ),
  },
  {
    key: '2',
    enable: <Switch checkedChildren="已启用" unCheckedChildren="已禁用" defaultChecked />,
    name: 'Jim Green',
    age: 42,
  },
  {
    key: '3',
    enable: <Switch checkedChildren="已启用" unCheckedChildren="已禁用" defaultChecked />,
    name: 'Joe Black',
    age: 32,
  },
  {
    key: '33',
    enable: <Switch checkedChildren="已启用" unCheckedChildren="已禁用" defaultChecked />,
    name: 'Joe Black',
    age: 32,
  },
  {
    key: '32',
    enable: <Switch checkedChildren="已启用" unCheckedChildren="已禁用" defaultChecked />,
    name: 'Joe Black',
    age: 32,
  },
  {
    key: '31',
    enable: <Switch checkedChildren="已启用" unCheckedChildren="已禁用" defaultChecked />,
    name: 'Joe Black',
    age: 32,
  },
];
class Certs extends Component {
  render() {
    const { hide } = this.props;
    return (
      <div className={`fill vbox p-certs${hide ? ' p-hide' : ''}`}>
        <div className="p-action-bar">
          <Button type="primary"><Icon type="upload" />上传证书</Button>
        </div>
        <div className="fill p-content">
          <Table columns={columns} dataSource={data} pagination={false} />
        </div>
      </div>
    );
  }
}

export default Certs;
