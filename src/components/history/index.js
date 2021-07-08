import React, { Component } from 'react';
import { Icon, Menu, Dropdown } from 'antd';
import RulesHistory from './helper';
import './index.css';

const historyHelper = new RulesHistory();

let isSkipRecord = false;

class History extends Component {
  componentDidMount() {
    // iframe 规则切换回调
    window.onWhistleRulesActiveChange = this.rulesActiveChange;
  }

  // whistle 规则切换时触发
  rulesActiveChange = (envName, name) => {
    const { data } = this.props;

    // 回退历史记录，也会触发规则切换回调，这里不做记录
    if (isSkipRecord) {
      isSkipRecord = false;
      return;
    }

    if (!Array.isArray(name)) {
      name = data[0];
    }
    const val = `${name}/${envName}`;

    historyHelper.add(val);
  };

  changeRules = target => {
    const targetArr = target.split('/');
    const name = targetArr[0];
    let envName = targetArr.slice(1).join('');

    envName = envName === 'Default' ? '' : envName;

    isSkipRecord = true;

    this.props.onChange(name, envName);
  };

  ruleHistoryBack = () => {
    const latest = historyHelper.back();
    if (!latest) {
      return;
    }

    this.changeRules(latest);
  };

  onHandleMenuClick = item => {
    const val = item.key;
    historyHelper.add(val);
    this.changeRules(val);
  };

  renderHistoryMenu = () => {
    const history = historyHelper.get();
    const menuItems = history.map((item) => (
      <Menu.Item key={item} onClick={this.onHandleMenuClick}>
        {item}
      </Menu.Item>
    ));

    return <Menu>{menuItems}</Menu>;
  };

  render() {
    return (
      <Dropdown overlay={this.renderHistoryMenu} trigger={['hover']} overlayClassName="history-dropdown">
        <a className="history" onClick={this.ruleHistoryBack}>
          <Icon width="40" height="40" type="arrow-left" />
        </a>
      </Dropdown>
    );
  }
}

export default History;
