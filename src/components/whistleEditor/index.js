import React, { Component } from 'react';
import Editor from 'whistle-editor';
import { Icon, Button, message } from 'antd';
import { isPressEnter } from '../../admin/util';
import Panel from '../panel';
import './index.css';

class WhistleEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
      isSaveBtnDisabled: true,
    };
  }

  handleChange = (e) => {
    const value = e.getValue();
    const { maxLength } = this.props;

    if (value.length > maxLength) {
      message.error(`超过最大字数限制${maxLength}`);
      return;
    }

    this.setState({
      isSaveBtnDisabled: false,
      value,
    });
    if (this.props.handleChange) {
      this.props.handleChange(e);
    }
  }

  handleSave = (e) => {
    if (isPressEnter(e)) {
      this.props.handleSave(e, this.state.value);
    }
  }

  // 提供给父组件调用
  setBtnDisabled = (isSaveBtnDisabled) => {
    this.setState({ isSaveBtnDisabled });
  }

  render() {
    const { buttons, title } = this.props;
    const { value, isSaveBtnDisabled } = this.state;

    return (
      <Panel>
        <div className="p-action-bar">
          {title}
          {
            buttons
              ? [...buttons]
              : (
                <Button
                  type="primary"
                  onClick={this.handleSave}
                  disabled={isSaveBtnDisabled}
                ><Icon type="save" /> 保存
                </Button>
              )
            }
        </div>
        <Editor
          value={value}
          theme="default"
          onChange={this.handleChange}
          className="w-editor"
          mode="rules"
        />
      </Panel>
    );
  }
}

export default WhistleEditor;
