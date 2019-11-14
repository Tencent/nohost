import React, { Component } from 'react';
import { Icon, Button, message } from 'antd';
import { getActiveTabFromHash, setActiveHash, evalJson } from '../util';
import { getSettings, setJsonData, setTestRules, setDefaultRules, setRulesTpl, setEntryPatterns } from '../cgi';
import TextAreaPanel from '../../components/textAreaPanel';
import Tabs from '../../components/tab';
import './index.css';

const { TabPane } = Tabs;

class Config extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: getActiveTabFromHash('administrator'),
      jsonDataDisabled: true,
    };
  }

  componentDidMount() {
    getSettings(this.setState.bind(this));
  }

  // 切换页面时，重置二级菜单为默认值
  static getDerivedStateFromProps(props) {
    if (props.hide === true) {
      return {
        activeKey: 'rulesConfig',
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

  onJsonDataChange = (e) => {
    this.setState({
      jsonData: e.target.value,
      jsonDataDisabled: false,
    });
  }

  setEntryPatterns = (e, value) => {
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

  setRulesTpl = (e, value) => {
    setRulesTpl({ rulesTpl: value }, (data) => {
      if (!data) {
        message.error('操作失败，请稍后重试');
        this.rulesTplPanel.setBtnDisabled(false);
        return;
      }
      message.success('配置规则模板成功！');
      this.rulesTplPanel.setBtnDisabled(true);
    });
  }

  setJsonData = () => {
    const jsonData = this.formatJsonData();
    if (jsonData === false) {
      return;
    }
    this.setState({ jsonData, jsonDataDisabled: true });
    setJsonData({ jsonData }, (data) => {
      if (!data) {
        message.error('操作失败，请稍后重试');
        this.setState({ jsonDataDisabled: false });
        return;
      }
      message.success('配置数据对象成功！');
    });
  }

  formatJsonData = () => {
    let { jsonData } = this.state;
    jsonData = jsonData && jsonData.trim();
    if (!jsonData) {
      return '';
    }
    let err;
    try {
      jsonData = JSON.parse(jsonData);
    } catch (e) {
      err = e;
      jsonData = evalJson(jsonData);
    }
    if (jsonData && typeof jsonData === 'object') {
      try {
        return JSON.stringify(jsonData, null, '  ');
      } catch (e) {
        err = err || e;
      }
    }
    message.error(err ? err.message : '请输入 JSON 对象！');
    return false;
  }


  render() {
    const { hide = false } = this.props;
    const {
      activeKey,
      ec,
      jsonData,
      rulesTpl,
      jsonDataDisabled,
      entryPatterns,
      defaultRules,
      testRules,
    } = this.state;

    if (ec !== 0) {
      return null;
    }
    return (
      <div className={`box p-config ${hide ? ' p-hide' : ''}`}>
        <Tabs defaultActiveKey="rulesConfig" onChange={this.handleClick} activeKey={activeKey}>
          <TabPane
            tab={(
              <span>
                <Icon type="menu" />
                入口配置
              </span>
            )}
            tabKey="entrySettings"
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
          <TabPane
            tab={(
              <span>
                <Icon type="code" />
                规则模板
              </span>
            )}
            tabKey="rulesConfig"
          >
            <div className="p-mid-con">
              <TextAreaPanel
                title="规则模板"
                value={rulesTpl}
                handleSave={this.setRulesTpl}
                maxLength="3072"
                ref={ref => this.rulesTplPanel = ref}
              />
            </div>
          </TabPane>
          <TabPane
            tab={(
              <span>
                <Icon type="database" />
                模板数据
              </span>
            )}
            tabKey="tplData"
          >
            <div className="p-mid-con">
              <TextAreaPanel
                title="模板数据"
                value={jsonData}
                handleChange={this.onJsonDataChange}
                handleSave={this.setJsonData}
                maxLength="3072"
                buttons={[
                  <Button key="save" type="primary" onClick={this.setJsonData} disabled={jsonDataDisabled}><Icon type="save" />保存</Button>]
                }
              />
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Config;
