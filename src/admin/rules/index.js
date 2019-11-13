import './index.css';
import React, { Component } from 'react';
import { Icon, message } from 'antd';
import { getActiveTabFromHash, setActiveHash, isPressEnter } from '../util';
import { getSettings, setTestRules, setDefaultRules, setEntryPatterns } from '../cgi';
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
  static getDerivedStateFromProps(props) {
    if (props.hide === true) {
      return {
        activeKey: 'entrySetting',
      };
    }
    return null;
  }

  handleClick = activeKey => {
    this.setState({
      activeKey,
    });
    setActiveHash(activeKey);
  };


  setEntryPatterns = (e, value) => {
    if (!isPressEnter(e)) {
      return;
    }

    setEntryPatterns({ entryPatterns: value }, (data) => {
      if (!data) {
        message.error('操作失败，请稍后重试！');
        this.entryPatternsPanel.setBtnDisabled(false);
        return;
      }
      message.success('入口规则配置成功！');
      this.entryPatternsPanel.setBtnDisabled(true);
    });
  }

  setTestRules = (e, value) => {
    if (!isPressEnter(e)) {
      return;
    }

    setTestRules({ testRules: value }, (data) => {
      if (!data) {
        message.error('操作失败，请稍后重试');
        this.testRulesPanel.setBtnDisabled(false);
        return;
      }
      message.success('配置专属规则成功！');
      this.testRulesPanel.setBtnDisabled(true);
    });
  }

  setDefaultRules = (e, value) => {
    if (!isPressEnter(e)) {
      return;
    }

    setDefaultRules({ defaultRules: value }, (data) => {
      if (!data) {
        message.error('操作失败，请稍后重试');
        this.defaultRulesPanel.setBtnDisabled(false);
        return;
      }
      message.success('配置默认规则成功！');
      this.defaultRulesPanel.setBtnDisabled(true);
    });
  }


  render() {
    const { hide = false } = this.props;
    const {
      activeKey,
      ec,
      entryPatterns,
      testRules,
      defaultRules,
    } = this.state;
    if (ec !== 0) {
      return null;
    }
    return (
      <div className={`box fill p-rules ${hide ? ' p-hide' : ''}`}>
        <Tabs defaultActiveKey="entrySetting" onChange={this.handleClick} activeKey={activeKey}>
          <TabPane
            tab={(
              <span>
                <Icon type="menu" />
                入口配置
              </span>
            )}
            tabKey="entrySetting"
          >
            <div className="p-mid-con">
              <TextAreaPanel
                title="入口配置"
                value={entryPatterns}
                handleSave={this.setEntryPatterns}
                maxLength="5120"
                ref={ref => this.entryPatternsPanel = ref}
              />
            </div>
          </TabPane>
          <TabPane
            className="vbox fill p-whistle"
            tab={(
              <span>
                <Icon type="unordered-list" />
                全局规则
              </span>
            )}
            tabKey="globalSetting"
          >
            <iframe title="全局规则" className="fill capture-win" src="whistle/" />
          </TabPane>
          <TabPane
            tab={(
              <span>
                <Icon type="user" />
                帐号规则
              </span>
            )}
            tabKey="accountRules"
          >
            <div className="p-mid-con">
              <TextAreaPanel
                title="默认规则"
                value={defaultRules}
                handleSave={this.setDefaultRules}
                maxLength="5120"
                ref={ref => this.defaultRulesPanel = ref}
              />
              <TextAreaPanel
                title="专属规则"
                value={testRules}
                handleSave={this.setTestRules}
                maxLength="5120"
                ref={ref => this.testRulesPanel = ref}
              />
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Rules;
