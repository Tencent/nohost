import React, { Component } from 'react';
import { message } from 'antd';
import ActionBar from './ActionBar';
import { getSettings, setJsonData, setRulesTpl } from '../cgi';
import { isPressEnter } from './util';

class Settings extends Component {
  state = {}

  componentDidMount() {
    getSettings(this.setState.bind(this));
  }

  onJsonDataChange = (e) => {
    this.setState({
      jsonData: e.target.value,
      jsonDataDisabled: false,
    });
  }

  onFormat = () => {
    const jsonData = this.formatJsonData();
    if (jsonData !== false) {
      this.setState({ jsonData });
    }
  }

  onRulesTplChange = (e) => {
    this.setState({
      rulesTpl: e.target.value,
      rulesTplDisabled: false,
    });
  }

  setJsonData = (e) => {
    if (!isPressEnter(e)) {
      return;
    }
    const jsonData = this.formatJsonData();
    if (jsonData === false) {
      return;
    }
    this.setState({ jsonData, jsonDataDisabled: true });
    setJsonData({ jsonData }, (data) => {
      if (!data) {
        this.setState({ jsonDataDisabled: false });
        message.error('操作失败，请稍后重试');
      }
    });
  }

  setRulesTpl =(e) => {
    if (!isPressEnter(e)) {
      return;
    }
    this.setState({ rulesTplDisabled: true });
    const { rulesTpl } = this.state;
    setRulesTpl({ rulesTpl }, (data) => {
      if (!data) {
        this.setState({ rulesTplDisabled: false });
        message.error('操作失败，请稍后重试');
      }
    });
  }

  formatJsonData = () => {
    let { jsonData } = this.state;
    jsonData = jsonData && jsonData.trim();
    if (!jsonData) {
      return '';
    }
    try {
      jsonData = JSON.parse(jsonData);
      if (jsonData && typeof jsonData === 'object') {
        return JSON.stringify(jsonData, null, '  ');
      }
    } catch (e) {
      message.error(e.message);
    }
    return false;
  }

  showHelp() {
    window.open('https://github.com/imweb/nohost');
  }

  render() {
    const {
      ec,
      jsonData,
      rulesTpl,
      jsonDataDisabled,
      rulesTplDisabled,
    } = this.state;
    if (ec !== 0) {
      return null;
    }
    return (
      <div className="n-settings">
        <fieldset>
          <legend>规则模板</legend>
          <ActionBar
            onClickHelp={this.showHelp}
            onClick={this.setRulesTpl}
            disabled={rulesTplDisabled}
          />
          <textarea
            value={rulesTpl}
            onKeyDown={this.setRulesTpl}
            onChange={this.onRulesTplChange}
            maxLength="3072"
            placeholder="请输入规则模板"
          />
        </fieldset>
        <fieldset>
          <legend>模板数据</legend>
          <ActionBar
            onFormat={this.onFormat}
            onClickHelp={this.showHelp}
            onClick={this.setJsonData}
            disabled={jsonDataDisabled}
          />
          <textarea
            value={jsonData}
            onKeyDown={this.setJsonData}
            onChange={this.onJsonDataChange}
            maxLength="30720"
            className="n-data-config"
            placeholder="请输入JSON对象供规则模板使用"
          />
        </fieldset>
      </div>
    );
  }
}

export default Settings;
