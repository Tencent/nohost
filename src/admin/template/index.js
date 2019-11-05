import React, { Component } from 'react';
import { Icon, Input, Button, message } from 'antd';
import Panel from '../../components/panel';
import { getActiveTabFromHash, setActiveHash, isPressEnter } from '../util';
import { getSettings, setJsonData, setRulesTpl } from '../cgi';
import Tabs from '../../components/tab';
import './index.css';

const { TextArea } = Input;
const { TabPane } = Tabs;

class Template extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: getActiveTabFromHash('administrator'),
      rulesTplDisabled: true,
      jsonDataDisabled: true,
    };
  }

  componentDidMount() {
    getSettings(this.setState.bind(this));
  }

  // 切换页面时，重置二级菜单为默认值
  componentWillReceiveProps(props) {
    if (props.hide === false) {
      this.setState({
        activeKey: 'rulesTemplate',
      });
    }
  }

  handleClick = activeKey => {
    this.setState({
      activeKey,
    });
    setActiveHash(activeKey);
  };

  onRulesTplChange = (e) => {
    this.setState({
      rulesTpl: e.target.value,
      rulesTplDisabled: false,
    });
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


  render() {
    const { hide = false } = this.props;
    const {
      activeKey,
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
      <div className={`box p-template ${hide ? ' p-hide' : ''}`}>
        <Tabs defaultActiveKey="rulesTemplate" onChange={this.handleClick} activeKey={activeKey}>
          <TabPane
            tab={(
              <span>
                <Icon type="book" />
                规则模板
              </span>
            )}
            key="rulesTemplate"
          >
            <div className="p-mid-con">
              <Panel title="规则模板">
                <div className="p-action-bar">
                  <Button type="primary" onClick={this.setRulesTpl} disabled={rulesTplDisabled}><Icon type="save" />保存</Button>
                </div>
                <TextArea
                  className="p-textarea"
                  onChange={this.onRulesTplChange}
                  onKeyDown={this.setRulesTpl}
                  value={rulesTpl}
                  maxLength="3072"
                />
              </Panel>
            </div>
          </TabPane>
          <TabPane
            tab={(
              <span>
                <Icon type="book" />
                数据对象
              </span>
            )}
            key="dataObj"
          >
            <div className="p-mid-con">
              <Panel title="数据对象">
                <div className="p-action-bar">
                  <Button type="primary" style={{ marginRight: '10px' }} onClick={this.onFormat} disabled={jsonDataDisabled}><Icon type="tool" />格式化</Button>
                  <Button type="primary" onClick={this.setJsonData} disabled={jsonDataDisabled}><Icon type="save" />保存</Button>
                </div>
                <TextArea
                  className="p-textarea"
                  onChange={this.onJsonDataChange}
                  onKeyDown={this.setJsonData}
                  value={jsonData}
                  maxLength="3072"
                />
              </Panel>
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Template;
