import React, { Component } from 'react';
import { Icon, Button, Input } from 'antd';
import Panel from '../panel';

const { TextArea } = Input;

class TextAreaPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
      isSaveBtnDisabled: true,
    };
  }

  // 切换页面时，重置二级菜单为默认值
  static getDerivedStateFromProps(props) {
    if (props.value) {
      return {
        value: props.value,
      };
    }
    return null;
  }

  handleChange = (e) => {
    this.setState({
      value: e.target.value,
      isSaveBtnDisabled: false,
    });
    if (this.props.handleChange) {
      this.props.handleChange(e);
    }
  }

  handleSave = (e) => {
    this.props.handleSave(e, this.state.value);
  }

  setBtnDisabled = (isSaveBtnDisabled) => {
    this.setState({
      isSaveBtnDisabled,
    });
  }

  render() {
    const { maxLength, buttons, title } = this.props;
    const { value, isSaveBtnDisabled } = this.state;

    return (
      <Panel title={title}>
        <div className="p-action-bar">
          {
            buttons
              ? [...buttons]
              : <Button type="primary" onClick={this.handleSave} disabled={isSaveBtnDisabled}><Icon type="save" /> 保存</Button>
            }
        </div>
        <TextArea
          className="p-textarea"
          onChange={this.handleChange}
          onKeyDown={this.handleSave}
          value={value}
          maxLength={maxLength}
        />
      </Panel>
    );
  }
}

export default TextAreaPanel;
