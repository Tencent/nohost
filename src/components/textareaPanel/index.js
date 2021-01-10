import React, { Component } from 'react';
import { Icon, Button, Input } from 'antd';
import { isPressEnter } from '../../admin/util';
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

  handleChange = (e) => {
    this.setState({
      isSaveBtnDisabled: false,
      value: e.target.value,
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

  setBtnDisabled = (isSaveBtnDisabled) => {
    this.setState({ isSaveBtnDisabled });
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
