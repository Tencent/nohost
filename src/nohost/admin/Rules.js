import React, { Component } from 'react';
import { message } from 'antd';
import ActionBar from './ActionBar';
import { getSettings, setTestRules, setDefaultRules, setPluginRules, setEntryRules } from '../cgi';
import { isPressEnter } from './util';

class Settings extends Component {
  state = {}

  componentDidMount() {
    getSettings(this.setState.bind(this));
  }

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

  onPluginRulesChange = (e) => {
    this.setState({
      pluginRules: e.target.value,
      pluginRulesDisabled: false,
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

  setPluginRules = (e) => {
    if (!isPressEnter(e)) {
      return;
    }
    this.setState({ pluginRulesDisabled: true });
    const { pluginRules } = this.state;
    setPluginRules({ pluginRules }, (data) => {
      if (!data) {
        this.setState({ pluginRulesDisabled: false });
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

  showHelp() {
    window.open('https://github.com/imweb/nohost');
  }

  render() {
    const {
      ec,
      entryRules,
      testRules,
      defaultRules,
      pluginRules,
      entryRulesDisabled,
      testRulesDisabled,
      pluginRulesDisabled,
      defaultRulesDisabled,
    } = this.state;
    if (ec !== 0) {
      return null;
    }
    return (
      <div className="n-settings">
        <fieldset>
          <legend>入口规则</legend>
          <ActionBar
            onClickHelp={this.showHelp}
            onClick={this.setEntryRules}
            disabled={entryRulesDisabled}
          />
          <textarea
            value={entryRules}
            onKeyDown={this.setEntryRules}
            onChange={this.onEntryRulesChange}
            maxLength="5120"
            placeholder="请配置需要转发到账号的请求"
          />
        </fieldset>
        <fieldset>
          <legend>默认规则</legend>
          <ActionBar
            onClickHelp={this.showHelp}
            onClick={this.setDefaultRules}
            disabled={defaultRulesDisabled}
          />
          <textarea
            value={defaultRules}
            onKeyDown={this.setDefaultRules}
            onChange={this.onDefaultRulesChange}
            maxLength="5120"
            placeholder="请输入每个账号的默认规则"
          />
        </fieldset>
        <fieldset>
          <legend>默认环境</legend>
          <ActionBar
            onClickHelp={this.showHelp}
            onClick={this.setTestRules}
            disabled={testRulesDisabled}
          />
          <textarea
            value={testRules}
            onKeyDown={this.setTestRules}
            onChange={this.onTestRulesChange}
            maxLength="5120"
            placeholder="请输入每个测试环境的默认规则"
          />
        </fieldset>
        <fieldset>
          <legend>插件规则</legend>
          <ActionBar
            onClickHelp={this.showHelp}
            onClick={this.setPluginRules}
            disabled={pluginRulesDisabled}
          />
          <textarea
            value={pluginRules}
            onKeyDown={this.setPluginRules}
            onChange={this.onPluginRulesChange}
            maxLength="5120"
            placeholder="请输入配套插件的转发规则"
          />
        </fieldset>
      </div>
    );
  }
}

export default Settings;
