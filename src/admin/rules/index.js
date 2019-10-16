import './index.css';
import React, { Component } from 'react';
import { Menu, Table, Switch, Popconfirm, Button, Icon } from 'antd';

const columns = [
  {
    title: '启用',
    dataIndex: 'enable',
    key: 'enable',
    width: 120,
    render: text => <a>{text}</a>,
  },
  {
    title: '规则',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 200,
  },
];

const data = [
  {
    key: '1',
    enable: <Switch checkedChildren="已启用" unCheckedChildren="已禁用" defaultChecked />,
    name: 'John Brown',
    action: (
      <div className="p-accounts-action">
        <Popconfirm title="Sure to delete?" onConfirm={(record) => this.handleDelete(record.key)}>
          <a><Icon type="delete" />Delete</a>
        </Popconfirm>
        <Switch checkedChildren="启用小圆点" unCheckedChildren="禁用小圆点" defaultChecked />
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
class Rules extends Component {
  render() {
    const { hide } = this.props;
    return (
      <div className={`box p-rules${hide ? ' p-hide' : ''}`}>
        <div className="p-left-menu">
          <Menu>
            <Menu.Item key="0">
              <Icon type="mail" />
              入口配置
            </Menu.Item>
            <Menu.Item key="1">
              <Icon type="mail" />
              全局规则
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="mail" />
              帐号规则
            </Menu.Item>
          </Menu>
        </div>
        <div className="fill p-mid">
          <div className="p-mid-con">
            <h3 className="p-title">入口配置</h3>
            <div className="p-mid-ctn">
              <div className="p-action-bar">
                <Button type="primary"><Icon type="plus" />添加规则</Button>
              </div>
              <Table columns={columns} dataSource={data} pagination={false} />
            </div>
            <h3 className="p-title">全局规则</h3>
            <div className="p-mid-ctn">
              master的whistle规则配置
            </div>
            <h3 className="p-title">默认规则</h3>
            <div className="p-mid-ctn">
            默认规则
            </div>
            <h3 className="p-title">专属规则</h3>
            <div className="p-mid-ctn">
            专属规则
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Rules;
