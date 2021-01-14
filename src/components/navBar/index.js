import './index.css';
import React, { Component } from 'react';
import { Icon, Modal, message } from 'antd';
import { getVersion } from '../../admin/cgi';

const parseNum = n => parseInt(n, 10);

const compareVersion = (cur, next) => {
  if (!next) {
    return false;
  }
  cur = cur.split('.').map(parseNum);
  next = next.split('.').map(parseNum);
  if (next[0] !== cur[0]) {
    return next[0] > cur[0];
  }

  if (next[1] !== cur[1]) {
    return next[1] > cur[1];
  }

  return next[2] > cur[2];
};

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
      const hasNew = compareVersion(data.version, data.latestVersion);
      Modal.info({
        icon: null,
        content: (
          <div className="p-about-dialog">
            <div className="p-about-desc">远程环境配置及抓包调试系统</div>
            <div className="p-about-version">版本 {data.version}</div>
            <div className="p-about-update">
              <a
                style={{ color: hasNew ? 'red' : null }}
                href="https://www.npmjs.com/package/@nohost/server"
                rel="noopener noreferrer"
                target="_blank"
              >版本更新{hasNew ? `（有新版本 ${data.latestVersion}）` : ''}
              </a>
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
        >账号
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
        <button
          type="button"
          name="system"
          className={active === 'system' ? 'p-active' : undefined}
        >系统
        </button>
        <span className="p-help" onMouseEnter={this.showAboutMenu} onMouseLeave={this.hideAboutMenu}>
          <a href="https://nohosts.github.io/nohost/" rel="noopener noreferrer" target="_blank">
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
