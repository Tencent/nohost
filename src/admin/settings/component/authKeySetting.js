/* Tencent is pleased to support the open source community by making nohost-环境配置与抓包调试平台 available.
* Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved. The below software in
* this distribution may have been modified by THL A29 Limited ("Tencent Modifications").
* All Tencent Modifications are Copyright (C) THL A29 Limited.
* nohost-环境配置与抓包调试平台 is licensed under the MIT License except for the third-party components listed below.
*/

import React, { Component } from 'react';
import { Form, Input, Icon, Button, message } from 'antd';
import Panel from '../../../components/panel';
import { FORM_ITEM_LAYOUT, SUBMIT_BTN_LAYOUT } from '../../util';
import { setAuthKey } from '../../cgi';

const AUTH_KEY_RE = /^[\w.@-]{1,32}$/;
const AUTH_TITLE = <span><Icon type="setting" /> 设置 Auth Key</span>;

class AuthKeySetting extends Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, value) => {
      const { authKey } = value;
      if (!err) {
        setAuthKey({ authKey }, (data) => {
          if (!data) {
            message.error('操作失败，请稍后重试');
            return;
          }
          message.success('设置 AuthKey 成功！');
        });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { value = '' } = this.props;

    return (
      <div className="p-mid-con">
        <Panel title={AUTH_TITLE}>
          <Form {...FORM_ITEM_LAYOUT} onSubmit={this.handleSubmit}>
            <Form.Item label="Auth Key">
              {getFieldDecorator('authKey', {
                initialValue: value,
                rules: [
                  { required: true, message: '请输入 Auth Key !' },
                  { max: 32, message: ' Auth Key 最多不超过64个字符!' },
                  { pattern: AUTH_KEY_RE, message: '只能输入字母、数字、下划线、中划线、点及 @ 字符!' },
                ],
              })(<Input placeholder="请输入 Auth Key " maxLength={32} autoComplete="off" />)}
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

export default Form.create({ name: 'authKey' })(AuthKeySetting);
