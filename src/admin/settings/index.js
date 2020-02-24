import React, { Component } from 'react';
import { Icon, Button, Modal, message } from 'antd';
import Administrator from './component/administrator';
import Domain from './component/domain';
import AuthKeySetting from './component/authKeySetting';
import Panel from '../../components/panel';
import { getActiveTabFromHash, setActiveHash } from '../util';
import { getAdministratorSettings, restart } from '../cgi';
import './index.css';
import Tabs from '../../components/tab';

/* eslint-disable no-alert */
const { TabPane } = Tabs;
class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = { activeKey: getActiveTabFromHash('administrator') };
  }

  componentDidMount() {
    getAdministratorSettings(this.setState.bind(this));
  }

  handleClick = activeKey => {
    this.setState({
      activeKey,
    });
    setActiveHash(activeKey);
    if (this.props.onItemChange) {
      this.props.onItemChange(activeKey);
    }
  };

  restart = () => {
    const self = this;
    if (self.restarting) {
      return;
    }
    self.restarting = true;
    self.setState({});
    Modal.confirm({
      title: '重启服务可能会影响部分请求，确定重启？',
      onOk() {
        restart((data) => {
          if (data && data.ec === 0) {
            message.success('重启成功。');
          } else {
            message.error('重启失败！');
          }
          setTimeout(() => {
            self.restarting = false;
            self.setState({});
          }, 3000);
        });
      },
      onCancel() {
        self.restarting = false;
        self.setState({});
      },
    });
  }

  render() {
    const { hide = false } = this.props;
    const {
      activeKey,
      admin,
      domain,
      ec,
      authKey,
    } = this.state;

    if (ec !== 0) {
      return null;
    }
    return (
      <div className={`box p-settings ${hide ? ' p-hide' : ''}`}>
        <Tabs defaultActiveKey="administrator" onChange={this.handleClick} activeKey={activeKey}>
          <TabPane
            tab={(
              <span>
                <Icon type="user" />
                管理员
              </span>
            )}
            tabKey="administrator"
          >
            <Administrator value={admin} />
          </TabPane>
          <TabPane
            tab={(
              <span>
                <Icon type="global" />
                设置域名
              </span>
            )}
            tabKey="domain"
          >
            <Domain value={domain} />
          </TabPane>
          <TabPane
            tab={(
              <span>
                <Icon type="setting" />
                Auth Key
              </span>
            )}
            tabKey="authKeySetting"
          >
            <AuthKeySetting value={authKey} />
          </TabPane>
          <TabPane
            tab={(
              <span>
                <Icon type="redo" />
                重启操作
              </span>
            )}
            tabKey="restart"
          >
            <div className="p-mid-con">
              <Panel title="重启操作">
                <Button type="danger" disabled={this.restarting} onClick={this.restart}>重启</Button>
              </Panel>
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Settings;
