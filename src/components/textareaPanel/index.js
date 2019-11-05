import React, { Component } from 'react';
import { Icon, Button, Input } from 'antd';
import Panel from '../panel';

const { TextArea } = Input;

class TextAreaPanel extends Component {
  state = {
    value: this.props.value,
    isSaveBtnDisabled: true,
  }

  // 切换页面时，重置二级菜单为默认值
  componentWillReceiveProps(props) {
    if (props.value) {
      this.setState({
        value: props.value,
      });
    }
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
    this.setState({
      isSaveBtnDisabled: true,
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
