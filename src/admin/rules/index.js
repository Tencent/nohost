import './index.css';
import React, { Component } from 'react';
import { Button, Icon, Input, message } from 'antd';
import Panel from '../../components/panel';
import { getActiveTabFromHash, setActiveHash, isPressEnter } from '../util';
import { getSettings, setTestRules, setDefaultRules, setEntryRules } from '../cgi';
import Tabs from '../../components/tab';

const { TextArea } = Input;
const { TabPane } = Tabs;

class Rules extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: getActiveTabFromHash('entrySetting'),
      entryRulesDisabled: true,
      testRulesDisabled: true,
      defaultRulesDisabled: true,
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

  onEntryRulesChange = (e) => {
    this.setState({
      entryRules: e.target.value,
      entryRulesDisabled: false,
    });
  }

  onTestRulesChange = (e) => {
    this.setState({
      testRules: e.target.value,
      testRulesDisabled: false,
    });
  }

  onDefaultRulesChange = (e) => {
    this.setState({
      defaultRules: e.target.value,
      defaultRulesDisabled: false,
    });
  }

  setEntryRules = (e) => {
    if (!isPressEnter(e)) {
      return;
    }
    this.setState({ entryRulesDisabled: true });
    const { entryRules } = this.state;
    setEntryRules({ entryRules }, (data) => {
      if (!data) {
        this.setState({ entryRulesDisabled: false });
        message.error('操作失败，请稍后重试');
      }
    });
  }

  setTestRules = (e) => {
    if (!isPressEnter(e)) {
      return;
    }
    this.setState({ testRulesDisabled: true });
    const { testRules } = this.state;
    setTestRules({ testRules }, (data) => {
      if (!data) {
        this.setState({ testRulesDisabled: false });
        message.error('操作失败，请稍后重试');
      }
    });
  }

  setDefaultRules = (e) => {
    if (!isPressEnter(e)) {
      return;
    }
    this.setState({ defaultRulesDisabled: true });
    const { defaultRules } = this.state;
    setDefaultRules({ defaultRules }, (data) => {
      if (!data) {
        this.setState({ defaultRulesDisabled: false });
        message.error('操作失败，请稍后重试');
      }
    });
  }


  render() {
    const { hide = false } = this.props;
    const {
      activeKey,
      ec, ///////////
      entryRules,
      testRules,
      defaultRules,
      entryRulesDisabled,
      testRulesDisabled,
      defaultRulesDisabled,
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
              <Panel title="入口配置">
                <div className="p-action-bar">
                  <Button type="primary" onClick={this.setEntryRules} disabled={entryRulesDisabled}><Icon type="save" />保存</Button>
                </div>
                <TextArea
                  className="p-textarea"
                  onChange={this.onEntryRulesChange}
                  onKeyDown={this.setEntryRules}
                  value={entryRules}
                  maxLength="5120"
                />
              </Panel>
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
              <Panel title="全局规则">
                <div className="p-action-bar">
                  <Button type="primary" disabled><Icon type="save" />保存</Button>
                </div>
                <TextArea
                  className="p-textarea"
                  maxLength="5120"
                />
              </Panel>
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
              <Panel title="默认规则">
                <div className="p-action-bar">
                  <Button type="primary" onClick={this.setDefaultRules} disabled={defaultRulesDisabled}><Icon type="save" />保存</Button>
                </div>
                <TextArea
                  className="p-textarea"
                  onChange={this.onDefaultRulesChange}
                  onKeyDown={this.setDefaultRules}
                  value={defaultRules}
                  maxLength="5120"
                />
              </Panel>
              <Panel title="专属规则">
                <div className="p-action-bar">
                  <Button type="primary" onClick={this.setTestRules} disabled={testRulesDisabled}><Icon type="save" />保存</Button>
                </div>
                <TextArea
                  className="p-textarea"
                  onChange={this.onTestRulesChange}
                  onKeyDown={this.setTestRules}
                  value={testRules}
                  maxLength="5120"
                />
              </Panel>
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Rules;
