import './index.css';
import React, { Component } from 'react';
import { Menu, Icon, Input, Button } from 'antd';
import Panel from '../../components/panel';

const { TextArea } = Input;

class Template extends Component {
  render() {
    const { hide } = this.props;
    return (
      <div className={`box p-settings${hide ? ' p-hide' : ''}`}>
        <div className="p-left-menu">
          <Menu>
            <Menu.Item key="1">
              <Icon type="mail" />
              规则模板
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="mail" />
              数据对象
            </Menu.Item>
          </Menu>
        </div>
        <div className="fill p-mid">
          <div className="p-mid-con">
            <Panel title="规则模板">
              <div className="p-action-bar">
                <Button type="primary"><Icon type="save" />保存</Button>
              </div>
              <TextArea />
            </Panel>
            <Panel title="数据对象">
              <div className="p-action-bar">
                <Button type="primary"><Icon type="save" />保存</Button>
              </div>
              <TextArea />
            </Panel>
          </div>
        </div>
      </div>
    );
  }
}

export default Template;
