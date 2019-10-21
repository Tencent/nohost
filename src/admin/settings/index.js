import './index.css';
import React, { Component } from 'react';
import { Menu, Icon, Button } from 'antd';
import Administrator from './component/administrator';
import TokenSetting from './component/tokenSetting';
import Panel from '../../components/panel';

const { location } = window;

class Settings extends Component {
  constructor(props) {
    super(props);
    const tabName = location.hash.split('/')[1];
    if (!tabName) {
      location.hash = location.hash.replace(/(#.*)/, '$1/administrator');
    }
    const active = tabName || 'administrator';
    this.state = { active };
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
      <div className={`box p-settings${hide ? ' p-hide' : ''}`}>
        <div className="p-left-menu">
          <Menu onClick={this.handleClick} selectedKeys={[active]}>
            <Menu.Item key="administrator">
              <Icon type="mail" />
              管理员
            </Menu.Item>
            <Menu.Item key="tokenSetting">
              <Icon type="mail" />
              设置Token
            </Menu.Item>
            <Menu.Item key="restart">
              <Icon type="mail" />
              重启操作
            </Menu.Item>
          </Menu>
        </div>
        <div className="vbox fill p-mid">
          <div className="p-mid-con">
            <Panel title="管理员" hide={active !== 'administrator'}>
              <div className="p-action-bar">
                <Administrator />
              </div>
            </Panel>
            <Panel title="设置Token" hide={active !== 'tokenSetting'}>
              <div className="p-action-bar">
                <TokenSetting />
              </div>
            </Panel>
            <Panel title="重启操作" hide={active !== 'restart'}>
              <div className="p-action-bar">
              <Button type="primary">重启</Button>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    );
  }
}

export default Settings;
