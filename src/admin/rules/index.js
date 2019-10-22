import './index.css';
import React, { Component } from 'react';
import { Menu, Button, Icon, Input, Table, Switch, Popconfirm } from 'antd';
import Panel from '../../components/panel';

const { TextArea } = Input;
const { location } = window;

const columns = [
  {
    title: '启用',
    dataIndex: 'enable',
    key: 'enable',
    width: 120,
    render: text => <a>{text}</a>,
  },
  {
    title: '匹配规则',
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
  constructor(props) {
    super(props);
    const tabName = location.hash.split('/')[1];
    if (!tabName) {
      location.hash = location.hash.replace(/(#.*)/, '$1/entrySetting');
    }
    const active = tabName || 'entrySetting';
    this.state = { active };
  }

  componentWillReceiveProps(props) {
    const subMenu = location.hash.match(/#.*\/(.*)/);
    const active = subMenu ? subMenu[1] : 'entrySetting';
    if (props.hide === false) {
      this.setState({
        active,
      });
    }
  }

  handleClick = e => {
    const { key } = e;
    this.setState({
      active: key,
    });
    location.hash = location.hash.replace(/(#.*\/).*/, `$1${key}`);
  };

  render() {
    const { hide = false } = this.props;
    const { active } = this.state;

    return (
      <div className={`box p-rules${hide ? ' p-hide' : ''}`}>
        <div className="p-left-menu">
          <Menu onClick={this.handleClick} selectedKeys={[active]}>
            <Menu.Item key="entrySetting">
              <Icon type="mail" />
              入口配置
            </Menu.Item>
            <Menu.Item key="globalRules">
              <Icon type="mail" />
              全局规则
            </Menu.Item>
            <Menu.Item key="accountRules">
              <Icon type="mail" />
              帐号规则
            </Menu.Item>
          </Menu>
        </div>
        <div className="fill p-mid">
          <div className="p-mid-con">
            {/* 入口配置 */}
            <Panel title="入口配置" hide={active !== 'entrySetting'}>
              <div className="p-action-bar">
                <Button type="primary"><Icon type="plus" />添加规则</Button>
              </div>
              <Table columns={columns} dataSource={data} pagination={false} />
            </Panel>

            {/* 全局规则 */}
            <Panel title="全局规则" hide={active !== 'globalRules'}>
              <div className="p-action-bar">
                <Button type="primary"><Icon type="save" />保存</Button>
              </div>
              <TextArea className="p-textarea" />
            </Panel>

            {/* 帐号规则 */}
            <div className={active !== 'accountRules' ? 'p-hide' : 'p-accounts-rules'}>
              <Panel title="默认规则">
                <div className="p-action-bar">
                  <Button type="primary"><Icon type="save" />保存</Button>
                </div>
                <TextArea className="p-textarea" />
              </Panel>
              <Panel title="专属规则">
                <div className="p-action-bar">
                  <Button type="primary"><Icon type="save" />保存</Button>
                </div>
                <TextArea className="p-textarea" />
              </Panel>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Rules;
