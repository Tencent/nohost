import React, { Component } from 'react';
import { Menu, Icon, Button } from 'antd';
import Administrator from './component/administrator';
import Domain from './component/domain';
import TokenSetting from './component/tokenSetting';
import Panel from '../../components/panel';
import './index.css';

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

  componentWillReceiveProps(props) {
    const subMenu = location.hash.match(/#.*\/(.*)/);
    const active = subMenu ? subMenu[1] : 'administrator';
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
      <div className={`box p-settings${hide ? ' p-hide' : ''}`}>
        <div className="p-left-menu">
          <Menu onClick={this.handleClick} selectedKeys={[active]}>
            <Menu.Item key="administrator">
              <Icon type="user" />
              管理员
            </Menu.Item>
            <Menu.Item key="domain">
              <Icon type="global" />
              设置域名
            </Menu.Item>
            <Menu.Item key="tokenSetting">
              <Icon type="setting" />
              设置Token
            </Menu.Item>
            <Menu.Item key="restart">
              <Icon type="redo" />
              重启操作
            </Menu.Item>
          </Menu>
        </div>
        <div className="vbox fill p-mid">
          <div className="p-mid-con">
            <div className={active !== 'administrator' ? 'p-hide' : ''}>
              <Administrator />
            </div>
            <div className={active !== 'domain' ? 'p-hide' : ''}>
              <Domain />
            </div>
            <Panel title="设置Token" hide={active !== 'tokenSetting'}>
              <div className="p-action-bar">
                <TokenSetting />
              </div>
            </Panel>
            <Panel title="重启操作" hide={active !== 'restart'}>
              <div className="p-action-bar restart-action-bar">
                <Button type="danger">重启</Button>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    );
  }
}

export default Settings;
