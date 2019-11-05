import React, { Component } from 'react';
import { message, Input } from 'antd';
import ActionBar from './ActionBar';
import { getSettings, setAuthKey } from '../cgi';
import { isPressEnter } from './util';

class Settings extends Component {
  state = {}

  componentDidMount() {
    getSettings(this.setState.bind(this));
  }

  onAuthKeyChange = (e) => {
    this.setState({
      authKey: e.target.value.replace(/[^\w.@-]+/, ''),
      authKeyDisabled: false,
    });
  }

  setAuthKey = (e) => {
    if (!isPressEnter(e)) {
      return;
    }
    this.setState({ authKeyDisabled: true });
    const { authKey } = this.state;
    setAuthKey({ authKey }, (data) => {
      if (!data) {
        this.setState({ authKeyDisabled: false });
        message.error('操作失败，请稍后重试');
      }
    });
  };

  showHelp() {
    window.open('https://github.com/imweb/nohost');
  }

  render() {
    const {
      ec,
      authKey,
      authKeyDisabled,
    } = this.state;
    if (ec !== 0) {
      return null;
    }
    return (
      <div className="n-settings">
        <fieldset>
          <legend>Auth Key</legend>
          <ActionBar
            onClick={this.setAuthKey}
            disabled={authKeyDisabled}
          />
          <Input
            className="n-auth-key-input"
            value={authKey}
            onKeyDown={this.setAuthKey}
            onChange={this.onAuthKeyChange}
            maxLength="32"
            placeholder="请输入校验Open API的key"
          />
        </fieldset>
      </div>
    );
  }
}

export default Settings;
