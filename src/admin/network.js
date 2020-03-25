import React from 'react';
import ReactDOM from 'react-dom';
import { parse } from 'query-string';
import { Modal, Button, Input } from 'antd';
import Upload from '../components/upload';
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

  loadSessions = () => {
    if (!this.api || (encrypted && !this.accessCode)) {
      return;
    }
    getSessions({
      name,
      date,
      username,
      code: this.accessCode || '',
    }, (data) => {
      if (data) {
        this.api.importSessions(data);
      }
    });
  }

  onChange = (e) => {
    const { value } = e.target;
    this.setState({ value: value.replace(/\s+/g, ''), disabled: !ACCESS_CODE_RE.test(value) });
  }

  onConfirm = () => {
    const { value } = this.state;
    if (!ACCESS_CODE_RE.test(value)) {
      return;
    }
    this.accessCode = value;
    this.loadSessions();
    this.setState({ visible: false });
  };

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
            <Input value={value} onChange={this.onChange} placeholder="请输入四位提取码" maxLength={4} />
          </Modal>
        ) : null}
        <Upload />
        <iframe title="network" className="fill capture-win" src={`network/#network?ip=self${clearNetwork}`} />
      </div>
    );
  }
}

ReactDOM.render(<Network />, document.getElementById('root'));
