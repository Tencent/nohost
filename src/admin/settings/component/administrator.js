import React, { Component } from 'react';
import { Icon, Form, Input, Button, message, Modal } from 'antd';
import Panel from '../../../components/panel';
import { FORM_ITEM_LAYOUT, SUBMIT_BTN_LAYOUT } from '../../util';
import { setAdmin } from '../../cgi';

class Administrator extends Component {
  submitAdmin = e => {
    e.preventDefault();
    Modal.confirm({
      title: '修改管理账号会导致系统重启，请谨慎操作！',
      onOk: () => {
        this.props.form.validateFields((err, value) => {
          const { username, password } = value;
          if (!err) {
            setAdmin({ username, password }, (data) => {
              if (!data) {
                message.error('操作失败，请稍后重试!');
                return;
              }
              message.success('设置管理员名字和密码成功！');
            });
          }
        });
      },
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { value = {} } = this.props;
    return (
      <div className="p-mid-con">
        <Panel title="设置管理员账号和密码">
          <Form {...FORM_ITEM_LAYOUT} onSubmit={this.submitAdmin}>
            <Form.Item label="管理员账号">
              {getFieldDecorator('username', {
                initialValue: value.username || '',
                rules: [
                  { required: true, message: '请输入用户名!' },
                  { pattern: /^[\w.-]+$/, message: '只能输入字母、数字、点（.）、下划线（_）、中划线（-）' },
                ],
              })(<Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="请输入账号"
                autoComplete="off"
                maxLength={32}
              />)}
            </Form.Item>
            <Form.Item label="管理员密码">
              {getFieldDecorator('password', {
                rules: [{ required: true, message: '请输入密码!' }],
              })(<Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="请输入密码"
                type="password"
                autoComplete="off"
                maxLength={32}
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
