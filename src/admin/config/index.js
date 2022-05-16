/* Tencent is pleased to support the open source community by making nohost-环境配置与抓包调试平台 available.
* Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved. The below software in
* this distribution may have been modified by THL A29 Limited ("Tencent Modifications").
* All Tencent Modifications are Copyright (C) THL A29 Limited.
* nohost-环境配置与抓包调试平台 is licensed under the MIT License except for the third-party components listed below.
*/

import React, { Component } from 'react';
import { Icon, Button, Modal, message, Input } from 'antd';

import { getActiveTabFromHash, setActiveHash, evalJson } from '../util';
import {
  getSettings,
  setJsonData,
  setTestRules,
  setAccountRules,
  setDefaultRules,
  setRulesTpl,
  setEntryPatterns,
  setSpecPattern,
} from '../cgi';
import TextAreaPanel from '../../components/textareaPanel';
import WhistleEditor from '../../components/whistleEditor';
import Tabs from '../../components/tab';
import './index.css';

const REG_EXP_RE = /^\s*\/(.+)\/([ium]{0,3})\s*$/;
const { TabPane } = Tabs;
const WHITE_REQ_TITLE = <strong><Icon type="filter" /> 入口配置</strong>;
const ACCOUNT_RULES_TITLE = <strong><Icon type="user" /> 账号默认规则</strong>;
const DEFAULT_RULES_TITLE = <strong><Icon type="file" /> 环境默认规则</strong>;
const SPECIAL_RULES_TITLE = <strong><Icon type="file-text" /> 专属环境默认规则</strong>;
const TPL_TITLE = <strong><Icon type="code" /> 规则模板</strong>;
const DATA_TITLE = <strong><Icon type="database" /> 模板配置</strong>;

/**
 * 配置菜单对应的内容
 * 1. 入口配置
 * 2. 账号配置
 * 3. 规则模板
 * 4. 模板配置
 */
class Config extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: getActiveTabFromHash('administrator'),
      jsonDataDisabled: true,
      specPattern: props.specPattern || '',
    };
  }

  componentDidMount() {
    // 组件加载时初始化数据，后续需要刷新页面才能更新
    getSettings(this.setState.bind(this));
  }

  // 处理菜单事件
  handleClick = activeKey => {
    this.setState({
      activeKey,
    });
    setActiveHash(activeKey);
    if (this.props.onItemChange) {
      this.props.onItemChange(activeKey);
    }
  };

  // 处理模板配置数据变更
  onJsonDataChange = (e) => {
    this.setState({
      jsonData: e.target.value,
      jsonDataDisabled: false,
    });
  }

  // 入口配置
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

  // 专属环境默认
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

  // 环境默认规则
  setDefaultRules = (e, value) => {
    setDefaultRules({ defaultRules: value }, (data) => {
      if (!data) {
        message.error('操作失败，请稍后重试');
        this.defaultRulesPanel.setBtnDisabled(false);
        return;
      }
      message.success('配置环境默认规则成功！');
      this.defaultRulesPanel.setBtnDisabled(true);
    });
  }

  // 账号默认规则
  setAccountRules = (e, value) => {
    setAccountRules({ rules: value }, (data) => {
      if (!data) {
        message.error('操作失败，请稍后重试');
        this.accountRulesPanel.setBtnDisabled(false);
        return;
      }
      message.success('配置账号默认规则成功！');
      this.accountRulesPanel.setBtnDisabled(true);
    });
  }

  // 规则模板
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

  // 模板配置
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
      message.success('配置模板配置成功！');
    });
  }

  editSpecSettings = () => {
    this.setState({ visible: true });
  }

  handleCancel = () => {
    this.setState({ visible: false });
  }

  onSpecPatternChange = (e) => {
    this.setState({ specPattern: e.target.value, hasChanged: true });
  }

  handleSave = () => {
    if (this._pendingSpecPattern) {
      return;
    }
    this._pendingSpecPattern = true;
    setSpecPattern({ specPattern: this.state.specPattern }, (data) => {
      this._pendingSpecPattern = false;
      if (!data) {
        message.error('操作失败，请稍后重试！');
        return;
      }
      message.success('设置成功！');
      this.setState({ visible: false, hasChanged: false });
    });
  }

  // 格式化 json 数据
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
      // 支持特殊 json 格式
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
      accountRules,
      defaultRules,
      testRules,
      visible,
      specPattern,
      hasChanged,
    } = this.state;

    if (ec !== 0) {
      return null;
    }
    return (
      <div className={`box p-config ${hide ? ' p-hide' : ''}`}>
        <Tabs defaultActiveKey="entrySettings" onChange={this.handleClick} activeKey={activeKey}>
          {/* 入口配置 */}
          <TabPane
            tab={(
              <span>
                <Icon type="filter" />
                入口配置
              </span>
            )}
            tabKey="entrySettings"
          >
            <div className="p-mid-con">
              <TextAreaPanel
                title={WHITE_REQ_TITLE}
                value={entryPatterns}
                handleSave={this.setEntryPatterns}
                maxLength="5120"
                ref={ref => {
                  this.entryPatternsPanel = ref;
                }}
              />
            </div>
          </TabPane>
          {/* 账号规则 */}
          <TabPane
            tab={(
              <span>
                <Icon type="user" />
                账号规则
              </span>
            )}
            tabKey="accountRules"
          >
            <div className="p-mid-con">
              <WhistleEditor
                title={ACCOUNT_RULES_TITLE}
                value={accountRules}
                handleSave={this.setAccountRules}
                maxLength="5120"
                ref={ref => {
                  this.accountRulesPanel = ref;
                }}
              />

              <WhistleEditor
                title={DEFAULT_RULES_TITLE}
                value={defaultRules}
                handleSave={this.setDefaultRules}
                maxLength="5120"
                ref={ref => {
                  this.defaultRulesPanel = ref;
                }}
              />

              <WhistleEditor
                title={SPECIAL_RULES_TITLE}
                value={testRules}
                handleSave={this.setTestRules}
                maxLength="5120"
                settingsBtn="设置匹配条件"
                onClickSettings={this.editSpecSettings}
                ref={ref => {
                  this.testRulesPanel = ref;
                }}
              />
            </div>
          </TabPane>
          {/* 规则模板 */}
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
                title={TPL_TITLE}
                value={rulesTpl}
                handleSave={this.setRulesTpl}
                maxLength="3072"
                ref={ref => {
                  this.rulesTplPanel = ref;
                }}
              />
            </div>
          </TabPane>
          {/* 模板配置 */}
          <TabPane
            tab={(
              <span>
                <Icon type="database" />
                模板配置
              </span>
            )}
            tabKey="tplData"
          >
            <div className="p-mid-con">
              <TextAreaPanel
                title={DATA_TITLE}
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
        <Modal
          title="专属于规则匹配以下正则的环境："
          visible={visible}
          className="n-editor-dialog"
          onCancel={this.handleCancel}
          width={530}
          footer={null}
        >
          <Input
            onChange={this.onSpecPatternChange}
            style={{ fontSize: 12 }}
            maxLength={256}
            value={specPattern}
            placeholder="输入正则表达式，默认 /^\s*([\w-]{1,64}:?|[\w.-]{1,64}:)(?:\s+([\w.:/-]*[\w-]))?\s*$/m"
          />
          <div className="n-editor-dialog-footer">
            <Button
              onClick={this.handleSave}
              type="primary"
              style={{ marginRight: 20 }}
              disabled={!hasChanged || (!!specPattern.trim() && !REG_EXP_RE.test(specPattern))}
            >保存
            </Button>
            <Button onClick={this.handleCancel}>关闭</Button>
          </div>
        </Modal>
      </div>
    );
  }
}

export default Config;
