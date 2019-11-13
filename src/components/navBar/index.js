import './index.css';
import React, { Component } from 'react';
// import { Icon } from 'antd';

class NavBar extends Component {
  state = {}

  // showAboutMenu = () => {
  //   this.setState({ displayAboutMenu: true });
  // }

  // hideAboutMenu = () => {
  //   this.setState({ displayAboutMenu: false });
  // }

  // showAboutDialog = () => {
  //   this.setState({
  //     displayAboutMenu: false,
  //   });
  // }

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
          name="rules"
          className={active === 'rules' ? 'p-active' : undefined}
        >Rules
        </button>
        <button
          type="button"
          name="template"
          className={active === 'template' ? 'p-active' : undefined}
        >配置
        </button>
        <button
          type="button"
          name="certs"
          className={active === 'certs' ? 'p-active' : undefined}
        >证书
        </button>
        {/* <button
          type="button"
          name="monitor"
          className={active === 'monitor' ? 'p-active' : undefined}
        >监控
        </button> */}
        <button
          type="button"
          name="settings"
          className={active === 'settings' ? 'p-active' : undefined}
        >设置
        </button>
        <span className="p-help" onMouseEnter={this.showAboutMenu} onMouseLeave={this.hideAboutMenu}>
          <a href="https://github.com/nohosts/nohost" rel="noopener noreferrer" target="_blank">
              帮助
            {/* <Icon type="down" className="p-help-menu" /> */}
          </a>
          {/* <button
            type="button"
            className="p-about"
            style={{ display: displayAboutMenu ? 'block' : undefined }}
            onClick={this.showAboutDialog}
          >关于 Nohost
          </button> */}
        </span>
      </div>
    );
  }
}

export default NavBar;
