import './index.css';
import React, { Component } from 'react';

import { Table, Switch, Popconfirm, Icon } from 'antd';

const columns = [
  {
    title: '启用',
    dataIndex: 'enable',
    key: 'enable',
    width: 140,
    render: text => <a>{text}</a>,
  },
  {
    title: '帐号',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 420,
  },
];

const data = [
  {
    key: '1',
    enable: <Switch checkedChildren="已启用" unCheckedChildren="已禁用" defaultChecked />,
    name: 'John Brown',
    action: (
      <div className="p-accounts-action">
        <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
          <a><Icon type="delete" />Delete</a>
        </Popconfirm>
        <a><Icon type="user-add" />Add</a>
        <a><Icon type="lock" />Change Password</a>
      </div>
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
class Accounts extends Component {
  render() {
    const { hide } = this.props;
    return (
      <div className={`p-accounts${hide ? ' p-hide' : ''}`}>
        <Table columns={columns} dataSource={data} pagination={false} />
      </div>
    );
  }
}

export default Accounts;
