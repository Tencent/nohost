import './index.css';
import React, { Component } from 'react';
import { Menu, Icon } from 'antd';

class Settings extends Component {
  render() {
    const { hide } = this.props;
    return (
      <div className={`box p-settings${hide ? ' p-hide' : ''}`}>
        <div className="p-left-menu">
          <Menu>
            <Menu.Item key="1">
              <Icon type="mail" />
              管理员设置
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="mail" />
              设置Token
            </Menu.Item>
            <Menu.Item key="3">
              <Icon type="mail" />
              重启操作
            </Menu.Item>
          </Menu>
        </div>
        <div className="vbox fill p-mid">
          <div className="p-mid-con">
            <h3 className="p-title">XXXXXXXX</h3>
            <div className="p-mid-ctn">
              ssssss
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Settings;
