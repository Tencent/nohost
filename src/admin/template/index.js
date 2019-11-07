import React, { Component } from 'react';
import { Icon, Button, message } from 'antd';
import { getActiveTabFromHash, setActiveHash, isPressEnter, evalJson } from '../util';
import { getSettings, setJsonData, setRulesTpl } from '../cgi';
import TextAreaPanel from '../../components/textAreaPanel';
import Tabs from '../../components/tab';
import './index.css';

const { TabPane } = Tabs;

class Template extends Component {
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

  onJsonDataChange = (e) => {
    this.setState({
      jsonData: e.target.value,
      jsonDataDisabled: false,
    });
  }

  setRulesTpl = (e, value) => {
    if (!isPressEnter(e)) {
      return;
    }
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
                <Icon type="book" />
                数据对象
              </span>
            )}
            key="dataObj"
          >
            <div className="p-mid-con">
              <TextAreaPanel
                title="数据对象"
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

export default Template;
