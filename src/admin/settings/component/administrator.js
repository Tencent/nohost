import React, { Component } from 'react';
import { Icon, Form, Input, Button, message } from 'antd';
import Panel from '../../../components/panel';
import { FORM_ITEM_LAYOUT, SUBMIT_BTN_LAYOUT } from '../../util';
import { setAdmin } from '../../cgi';

class Administrator extends Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, value) => {
      const { username, password } = value;
      if (!err) {
        setAdmin({ username, password }, (data) => {
          if (!data) {
            message.error('操作失败，请稍后重试');
            return;
          }
          message.success('设置管理员名字和密码成功！');
        });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { value = {} } = this.props;
    return (
      <div className="p-mid-con">
        <Panel title="设置管理员名字和密码">
          <Form {...FORM_ITEM_LAYOUT} onSubmit={this.handleSubmit}>
            <Form.Item label="用户名">
              {getFieldDecorator('username', {
                initialValue: value.username || '',
                rules: [{ required: true, message: '请输入用户名!' }],
              })(<Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="请输入用户名"
                autoComplete="off"
              />)}
            </Form.Item>
            <Form.Item label="密码">
              {getFieldDecorator('password', {
                initialValue: value.password || '',
                rules: [{ required: true, message: '请输入密码!' }],
              })(<Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="请输入密码"
                autoComplete="off"
              />)}
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

export default Form.create({ name: 'administrator' })(Administrator);
