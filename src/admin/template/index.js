import React, { Component } from 'react';
import { Icon, Input, Button } from 'antd';
import Panel from '../../components/panel';
import { getActiveTabFromHash, setActiveHash } from '../util';
import Tabs from '../../components/tab';
import './index.css';

const { TextArea } = Input;
const { TabPane } = Tabs;

class Template extends Component {
  constructor(props) {
    super(props);

    this.state = { activeKey: getActiveTabFromHash('administrator') };
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

  render() {
    const { hide = false } = this.props;
    const { activeKey } = this.state;

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
                  <Button type="primary"><Icon type="save" />保存</Button>
                </div>
                <TextArea className="p-textarea" />
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
                  <Button type="primary"><Icon type="save" />保存</Button>
                </div>
                <TextArea className="p-textarea" />
              </Panel>
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Template;
