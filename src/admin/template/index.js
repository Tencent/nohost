import './index.css';
import React, { Component } from 'react';
import { Menu, Icon, Input, Button } from 'antd';
import Panel from '../../components/panel';

const { TextArea } = Input;
const { location } = window;

class Template extends Component {
  constructor(props) {
    super(props);
    const tabName = location.hash.split('/')[1];
    if (!tabName) {
      location.hash = location.hash.replace(/(#.*)/, '$1/rulesTemplate');
    }
    const active = tabName || 'rulesTemplate';
    this.state = { active };
  }

  componentWillReceiveProps(props) {
    const subMenu = location.hash.match(/#.*\/(.*)/);
    const active = subMenu ? subMenu[1] : 'rulesTemplate';
    if (props.hide === false) {
      this.setState({
        active,
      });
    }
  }

  handleClick = e => {
    const { key } = e;
    this.setState({
      active: key,
    });
    location.hash = location.hash.replace(/(#.*\/).*/, `$1${key}`);
  };

  render() {
    const { hide = false } = this.props;
    const { active } = this.state;

    return (
      <div className={`box p-settings${hide ? ' p-hide' : ''}`}>
        <div className="p-left-menu">
          <Menu onClick={this.handleClick} selectedKeys={[active]}>
            <Menu.Item key="rulesTemplate">
              <Icon type="mail" />
              规则模板
            </Menu.Item>
            <Menu.Item key="dataObj">
              <Icon type="mail" />
              数据对象
            </Menu.Item>
          </Menu>
        </div>
        <div className="fill p-mid">
          <div className="p-mid-con">
            <Panel title="规则模板" hide={active !== 'rulesTemplate'}>
              <div className="p-action-bar">
                <Button type="primary"><Icon type="save" />保存</Button>
              </div>
              <TextArea className="p-textarea" />
            </Panel>
            <Panel title="数据对象" hide={active !== 'dataObj'}>
              <div className="p-action-bar">
                <Button type="primary"><Icon type="save" />保存</Button>
              </div>
              <TextArea className="p-textarea" />
            </Panel>
          </div>
        </div>
      </div>
    );
  }
}

export default Template;
