import './index.css';
import React, { Component } from 'react';
import { Button, Icon, Input, Table, Switch, Popconfirm } from 'antd';
import Panel from '../../components/panel';
import { getActiveTabFromHash, setActiveHash } from '../util';
import Tabs from '../../components/tab';

const { TextArea } = Input;
const { TabPane } = Tabs;

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

    this.state = { activeKey: getActiveTabFromHash('entrySetting') };
  }

  // 切换页面时，重置二级菜单为默认值
  componentWillReceiveProps(props) {
    if (props.hide === false) {
      this.setState({
        activeKey: 'entrySetting',
      });
    }
  }

  handleClick = activeKey => {
    this.setState({
      activeKey,
    });
    setActiveHash(activeKey);
  };

  render() {
    const { hide = false } = this.props;
    const { activeKey } = this.state;

    return (
      <div className={`box p-rules ${hide ? ' p-hide' : ''}`}>
        <Tabs defaultActiveKey="entrySetting" onChange={this.handleClick} activeKey={activeKey}>
          <TabPane
            tab={(
              <span>
                <Icon type="bars" />
                入口配置
              </span>
            )}
            key="entrySetting"
          >
            <div className="p-mid-con">
              <Panel title="入口配置">
                <div className="p-action-bar">
                  <Button type="primary"><Icon type="plus" />添加规则</Button>
                </div>
                <Table columns={columns} dataSource={data} pagination={false} />
              </Panel>
            </div>
          </TabPane>
          <TabPane
            tab={(
              <span>
                <Icon type="bars" />
                全局规则
              </span>
            )}
            key="globalSetting"
          >
            <div className="p-mid-con">
              <Panel title="全局规则">
                <div className="p-action-bar">
                  <Button type="primary"><Icon type="save" />保存</Button>
                </div>
                <TextArea className="p-textarea" />
              </Panel>
            </div>
          </TabPane>
          <TabPane
            tab={(
              <span>
                <Icon type="bars" />
                帐号规则
              </span>
            )}
            key="accountRules"
          >
            <div className="p-mid-con">
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
          </TabPane>
        </Tabs>


      </div>
    );
  }
}

export default Rules;
