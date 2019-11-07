import './index.css';
import React, { Component } from 'react';
import { Icon, message } from 'antd';
import { getActiveTabFromHash, setActiveHash, isPressEnter } from '../util';
import { getSettings, setTestRules, setDefaultRules, setEntryRules, setGlobalRules } from '../cgi';
import TextAreaPanel from '../../components/textAreaPanel';
import Tabs from '../../components/tab';

const { TabPane } = Tabs;

class Rules extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: getActiveTabFromHash('entrySetting'),
    };
  }

  componentDidMount() {
    getSettings(this.setState.bind(this));
  }

  // 切换页面时，重置二级菜单为默认值
  componentWillReceiveProps(props) {
    if (props.hide === false) {
      this.setState({
        activeKey: 'entrySetting',
      });
    }
  }

  handleClick = activeKey => {
    this.setState({
      activeKey,
    });
    setActiveHash(activeKey);
  };

  setEntryRules = (e, value) => {
    if (!isPressEnter(e)) {
      return;
    }

    setEntryRules({ entryRules: value }, (data) => {
      if (!data) {
        message.error('操作失败，请稍后重试');
        return;
      }
      message.success('配置入口规则成功！');
    });
  }

  setGlobalRules = (e, value) => {
    if (!isPressEnter(e)) {
      return;
    }

    setGlobalRules({ globalRules: value }, (data) => {
      if (!data) {
        message.error('操作失败，请稍后重试！');
        return;
      }
      message.success('全局规则设置成功！');
    });
  }

  setTestRules = (e, value) => {
    if (!isPressEnter(e)) {
      return;
    }

    setTestRules({ testRules: value }, (data) => {
      if (!data) {
        message.error('操作失败，请稍后重试');
        return;
      }
      message.success('配置专属规则成功！');
    });
  }

  setDefaultRules = (e, value) => {
    if (!isPressEnter(e)) {
      return;
    }

    setDefaultRules({ defaultRules: value }, (data) => {
      if (!data) {
        message.error('操作失败，请稍后重试');
        return;
      }
      message.success('配置默认规则成功！');
    });
  }


  render() {
    const { hide = false } = this.props;
    const {
      activeKey,
      ec,
      entryRules,
      globalRules,
      testRules,
      defaultRules,
    } = this.state;
    if (ec !== 0) {
      return null;
    }
    return (
      <div className={`box p-rules ${hide ? ' p-hide' : ''}`}>
        <Tabs defaultActiveKey="entrySetting" onChange={this.handleClick} activeKey={activeKey}>
          <TabPane
            tab={(
              <span>
                <Icon type="bars" />
                入口配置
              </span>
            )}
            key="entrySetting"
          >
            <div className="p-mid-con">
              <TextAreaPanel
                title="入口配置"
                value={entryRules}
                handleSave={this.setEntryRules}
                maxLength="5120"
              />
            </div>
          </TabPane>
          <TabPane
            tab={(
              <span>
                <Icon type="bars" />
                全局规则
              </span>
            )}
            key="globalSetting"
          >
            <div className="p-mid-con">
              <TextAreaPanel
                title="全局规则"
                value={globalRules}
                handleSave={this.setGlobalRules}
                maxLength="5120"
              />
            </div>
          </TabPane>
          <TabPane
            tab={(
              <span>
                <Icon type="bars" />
                帐号规则
              </span>
            )}
            key="accountRules"
          >
            <div className="p-mid-con">
              <TextAreaPanel
                title="默认规则"
                value={defaultRules}
                handleSave={this.setDefaultRules}
                maxLength="5120"
              />
              <TextAreaPanel
                title="专属规则"
                value={testRules}
                handleSave={this.setTestRules}
                maxLength="5120"
              />
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Rules;
