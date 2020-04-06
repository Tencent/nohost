import React from 'react';
import ReactDOM from 'react-dom';
import { parse } from 'query-string';
import { Modal, Button, Input } from 'antd';
import { importSessions as getSessions } from './cgi';
import { getString } from './util';
import '../base.less';

const ACCESS_CODE_RE = /^[a-z\d]{4}$/i;
let { name, date, username, encrypted } = parse(window.location.search);
name = getString(name);
date = getString(date);
username = getString(username);

const clearNetwork = name ? '&clearNetwork=true' : '';

class Network extends React.Component {
  constructor(props) {
    super(props);
    this.state = { disabled: true, visible: true };
    window.onWhistleReady = (api) => {
      this.api = api;
      if (name) {
        this.loadSessions();
      }
    };
  }

  componentDidMount() {
    if (encrypted) {
      setTimeout(() => {
        if (this.input) {
          this.input.focus();
        }
      }, 666);
    }
  }

  loadSessions = () => {
    if (this.loaded || !this.api || (encrypted && !this.accessCode)) {
      return;
    }
    const code = this.accessCode || '';
    getSessions({
      name,
      date,
      username,
      code,
    }, (data, xhr) => {
      if (data) {
        this.loaded = true;
        this.api.importSessions(data);
        return this.setState({ visible: false });
      }
      const status = xhr && xhr.status;
      let msg;
      if (code) {
        msg = status === 404 ? '提取码错误或数据不存在，请稍后重试！' : '数据加载失败，请稍后重试！';
        this.input.select();
      } else {
        msg = status === 404 ? '数据不存在！' : '数据加载失败，请刷新页面重试！';
      }
      alert(msg); // eslint-disable-line
    });
  }

  onChange = (e) => {
    const value = e.target.value.replace(/\s+/g, '').substring(0, 4);
    this.setState({ value, disabled: !ACCESS_CODE_RE.test(value) });
  }

  onConfirm = () => {
    const { value } = this.state;
    if (!ACCESS_CODE_RE.test(value)) {
      return;
    }
    this.accessCode = value;
    this.loadSessions();
  }

  render() {
    const { disabled, value, visible } = this.state;
    return (
      <div className="container fill vbox">
        {encrypted ? (
          <Modal
            visible={visible}
            closable={false}
            footer={[
              <Button
                onClick={this.onConfirm}
                title={disabled ? '请输入四位提取码（不区分大小写）' : undefined}
                disabled={disabled}
                key="confirm"
                type="primary"
              >
                确定
              </Button>,
            ]}
          >
            <Input
              ref={input => (this.input = input)}
              onPressEnter={this.onConfirm}
              value={value}
              onChange={this.onChange}
              placeholder="请输入四位提取码"
              maxLength={4}
            />
          </Modal>
        ) : null}
        <iframe title="network" className="fill capture-win" src={`network/#network?ip=self${clearNetwork}`} />
      </div>
    );
  }
}

ReactDOM.render(<Network />, document.getElementById('root'));
