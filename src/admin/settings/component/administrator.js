/* Tencent is pleased to support the open source community by making nohost-环境配置与抓包调试平台 available.
* Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved. The below software in
* this distribution may have been modified by THL A29 Limited ("Tencent Modifications").
* All Tencent Modifications are Copyright (C) THL A29 Limited.
* nohost-环境配置与抓包调试平台 is licensed under the MIT License except for the third-party components listed below.
*/

import React, { Component } from 'react';
import { Icon, Form, Input, Button, message, Popconfirm } from 'antd';
import Panel from '../../../components/panel';
import { FORM_ITEM_LAYOUT, SUBMIT_BTN_LAYOUT } from '../../util';
import { setAdmin } from '../../cgi';

const ADMIN_TITLE = <span><Icon type="user" /> 设置管理员账号和密码</span>;

class Administrator extends Component {
  submitAdmin = e => {
    e.preventDefault();
    this.props.form.validateFields((err, value) => {
      if (err) {
        return;
      }
      const { username, password } = value;
      setAdmin({ username, password }, (data) => {
        if (!data) {
          message.error('操作失败，请稍后重试!');
          return;
        }
        message.success('设置管理员名字和密码成功！');
      });
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { value = {} } = this.props;
    return (
      <div className="p-mid-con">
        <Panel title={ADMIN_TITLE}>
          <Form {...FORM_ITEM_LAYOUT}>
            <Form.Item label="管理员账号">
              {getFieldDecorator('username', {
                initialValue: value.username || '',
                rules: [
                  { required: true, message: '请输入账号名!' },
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
              <Popconfirm
                title="确认修改管理员账号？"
                onConfirm={this.submitAdmin}
              >
                <Button type="primary" htmlType="submit">
                  确定
                </Button>
              </Popconfirm>
            </Form.Item>
          </Form>
        </Panel>
      </div>
    );
  }
}

export default Form.create({ name: 'administrator' })(Administrator);
