import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Tabs, Icon } from 'antd';
import Accounts from './Accounts';
import Rules from './Rules';
import Tpl from './Tpl';
import Settings from './Settings';
import Capture from './capture';
import '../base.less';

const { TabPane } = Tabs;
const ACCOUNTS_TAB = [<Icon type="team" />, '账号'];
const RULES_TAB = [<Icon type="file-text" />, 'Rules'];
const TPL_TAB = [<span style={{ marginRight: 8 }}>@</span>, '模板'];
const SETTINGS_TAB = [<Icon type="setting" />, '设置'];
const CAPTURE_TAB = [<Icon type="eye-o" />, '抓包'];

const resizeCaptureWin = () => {
  const win = document.querySelector('.ant-tabs-tabpane:nth-child(4)');
  if (!win) {
    return;
  }
  const { clientHeight } = document.documentElement;
  const height = Math.max(300, clientHeight);
  win.style.height = `${height - 44}px`;
};

let timer;
window.addEventListener('resize', () => {
  clearTimeout(timer);
  timer = setTimeout(resizeCaptureWin, 100);
});

class Admin extends Component {
  state = {
    activeKey: 'accounts',
  }

  componentWillUpdate = resizeCaptureWin

  onTabChange = (key) => {
    this.setState({
      activeKey: key,
      [`inited${key[0].toUpperCase()}${key.substring(1)}`]: true,
    });
  }

  render() {
    const {
      activeKey,
      initedRules,
      initedTpl,
      initedSettings,
      initedCapture,
    } = this.state;
    return (
      <Tabs onChange={this.onTabChange} activeKey={activeKey} type="card">
        <TabPane tab={ACCOUNTS_TAB} key="accounts">
          <Accounts />
        </TabPane>
        <TabPane tab={RULES_TAB} key="rules">
          {
            initedRules ? <Rules /> : undefined
          }
        </TabPane>
        <TabPane tab={TPL_TAB} key="tpl">
          {
            initedTpl ? <Tpl /> : undefined
          }
        </TabPane>
        <TabPane tab={CAPTURE_TAB} key="capture">
          {
            initedCapture ? <Capture /> : undefined
          }
        </TabPane>
        <TabPane tab={SETTINGS_TAB} key="settings">
          {
            initedSettings ? <Settings /> : undefined
          }
        </TabPane>
      </Tabs>
    );
  }
}


ReactDOM.render(<Admin />, document.getElementById('root'));
