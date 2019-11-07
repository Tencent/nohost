import React, { Component } from 'react';
import { Icon, Form, Input, Button, message, Checkbox } from 'antd';
import Panel from '../../../components/panel';
import { FORM_ITEM_LAYOUT, SUBMIT_BTN_LAYOUT } from '../../util';
import { setAdmin } from '../../cgi';

class Administrator extends Component {
  constructor(props) {
    super(props);
    this.state = { enableGuest: !!props.enableGuest };
  }
  submitAdmin = e => {
    e.preventDefault();
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
  }

  submitGuest = e => {
    e.preventDefault();
  }

  onEnableGuest = ({ target }) => {
    this.setState({ enableGuest: target.checked });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { value = {} } = this.props;
    const { enableGuest } = this.state;
    return (
      <div className="p-mid-con">
        <Panel title="设置管理员账号和密码">
          <Form {...FORM_ITEM_LAYOUT} onSubmit={this.submitAdmin}>
            <Form.Item label="管理员账号">
              {getFieldDecorator('username', {
                initialValue: value.username || '',
                rules: [{ required: true, message: '请输入用户名!' }],
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

        <Panel title={<Checkbox
            checked={enableGuest}
            onChange={this.onEnableGuest}
          >启用访客账号和密码{enableGuest ? '（访客帐号或密码为空，表示无需登录即可以访客身份访问任何个人账号）' : ''}</Checkbox>}>
          <Form {...FORM_ITEM_LAYOUT} onSubmit={this.submitGuest}>
            <Form.Item label="访客账号">
              <Input
                disabled={!enableGuest}
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="请输入账号"
                autoComplete="off"
                maxLength={32}
              />
            </Form.Item>
            <Form.Item label="访客密码">
              <Input
                disabled={!enableGuest}
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="请输入密码"
                autoComplete="off"
                maxLength={32}
              />
            </Form.Item>
            <Form.Item {...SUBMIT_BTN_LAYOUT} style={{ marginBottom: 0 }}>
              <Button disabled={!enableGuest} type="primary" htmlType="submit">
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
