import React, { Component } from 'react';
import { Icon, Button } from 'antd';
import Administrator from './component/administrator';
import Domain from './component/domain';
import TokenSetting from './component/tokenSetting';
import WhiteList from './component/whiteList';
import Panel from '../../components/panel';
import { getActiveTabFromHash, setActiveHash } from '../utils';
import './index.css';
import Tabs from '../../components/tab';

const { TabPane } = Tabs;
class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = { activeKey: getActiveTabFromHash('administrator') };
  }

  // 切换页面时，重置二级菜单为默认值
  componentWillReceiveProps(props) {
    if (props.hide === false) {
      this.setState({
        activeKey: 'administrator',
      });
    }
  }

  handleClick = activeKey => {
    this.setState({
      activeKey,
    });
    setActiveHash(activeKey);
  };

  render() {
    const { hide = false } = this.props;
    const { activeKey } = this.state;

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
            key="administrator"
          >
            <Administrator />
          </TabPane>
          <TabPane
            tab={(
              <span>
                <Icon type="global" />
                设置域名
              </span>
            )}
            key="domain"
          >
            <Domain />
          </TabPane>
          <TabPane
            tab={(
              <span>
                <Icon type="setting" />
                设置Token
              </span>
            )}
            key="tokenSetting"
          >
            <TokenSetting />
          </TabPane>
          <TabPane
            tab={(
              <span>
                <Icon type="read" />
                白名单
              </span>
            )}
            key="whiteList"
          >
            <WhiteList />
          </TabPane>
          <TabPane
            tab={(
              <span>
                <Icon type="redo" />
                重启操作
              </span>
            )}
            key="restart"
          >
            <div className="p-mid-con">
              <Panel title="重启操作">
                <Button type="danger">重启</Button>
              </Panel>
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Settings;
