import React, { Component } from 'react';
import { Form, Input, Button, message } from 'antd';
import Panel from '../../../components/panel';
import { FORM_ITEM_LAYOUT, SUBMIT_BTN_LAYOUT } from '../../util';
import { setToken } from '../../cgi';

class TokenSetting extends Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, value) => {
      const { token } = value;
      if (!err) {
        setToken({ token }, (data) => {
          if (!data) {
            message.error('操作失败，请稍后重试');
            return;
          }
          message.success('设置Token成功！');
        });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { value = '' } = this.props;

    return (
      <div className="p-mid-con">
        <Panel title="设置Token">
          <Form {...FORM_ITEM_LAYOUT} onSubmit={this.handleSubmit}>
            <Form.Item label="Token">
              {getFieldDecorator('token', {
                initialValue: value,
                rules: [
                  { required: true, message: '请输入Token!' },
                  { max: 64, message: 'Token最多不超过64个字符!' },
                ],
              })(<Input placeholder="请输入Token" autoComplete="off" />)}
            </Form.Item>
            <Form.Item {...SUBMIT_BTN_LAYOUT} style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit">
                  确定
              </Button>
            </Form.Item>
          </Form>
        </Panel>
      </div>
    );
  }
}

export default Form.create({ name: 'token' })(TokenSetting);
