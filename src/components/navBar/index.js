import './index.css';
import React, { Component } from 'react';
import { Icon, Modal, message } from 'antd';
import { getVersion } from '../../admin/cgi';

class NavBar extends Component {
  state = {}

  showAboutMenu = () => {
    this.setState({ displayAboutMenu: true });
  }

  hideAboutMenu = () => {
    this.setState({ displayAboutMenu: false });
  }

  showAboutDialog = () => {
    this.setState({ displayAboutMenu: false });
    if (this.loadingVersion) {
      return;
    }
    this.loadingVersion = true;
    getVersion((data) => {
      this.loadingVersion = false;
      if (!data) {
        return message.error('请求失败，请稍后重试！');
      }
      Modal.info({
        icon: null,
        content: (
          <div className="p-about-dialog">
            <div className="p-about-desc">多用户环境配置及抓包调试系统</div>
            <div className="p-about-version">版本 {data.version}</div>
            <div className="p-about-update">
              <a href="https://www.npmjs.com/package/@nohost/server" rel="noopener noreferrer" target="_blank">版本更新（有新版本）</a>
            </div>
          </div>
        ),
      });
    });
  }

  onChange = ({ target }) => {
    if (target.nodeName !== 'BUTTON' || !target.name) {
      return;
    }
    const { onChange, active } = this.props;
    if (typeof onChange === 'function' && target.name !== active) {
      onChange(target.name, active);
    }
  }

  render() {
    const { active } = this.props;
    const { displayAboutMenu } = this.state;
    return (
      <div className="p-nav-bar" onClick={this.onChange}>
        <a href="https://github.com/nohosts/nohost" target="_blank" rel="noopener noreferrer" className="p-logo">
          Nohost
        </a>
        <button
          type="button"
          name="accounts"
          className={active === 'accounts' ? 'p-active' : undefined}
        >帐号
        </button>
        <button
          type="button"
          name="certs"
          className={active === 'certs' ? 'p-active' : undefined}
        >证书
        </button>
        <button
          type="button"
          name="config"
          className={active === 'config' ? 'p-active' : undefined}
        >配置
        </button>
        <button
          type="button"
          name="whistle"
          className={active === 'whistle' ? 'p-active' : undefined}
        >Whistle
        </button>
        {/* <button
          type="button"
          name="monitor"
          className={active === 'monitor' ? 'p-active' : undefined}
        >监控
        </button> */}
        <button
          type="button"
          name="system"
          className={active === 'system' ? 'p-active' : undefined}
        >系统
        </button>
        <span className="p-help" onMouseEnter={this.showAboutMenu} onMouseLeave={this.hideAboutMenu}>
          <a href="https://github.com/nohosts/nohost" rel="noopener noreferrer" target="_blank">
              帮助
            <Icon type="down" className="p-help-menu" />
          </a>
          <button
            type="button"
            className="p-about"
            style={{ display: displayAboutMenu ? 'block' : undefined }}
            onClick={this.showAboutDialog}
          >关于 Nohost
          </button>
        </span>
      </div>
    );
  }
}

export default NavBar;
