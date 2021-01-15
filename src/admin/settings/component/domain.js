/* Tencent is pleased to support the open source community by making nohost-环境配置与抓包调试平台 available.
* Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved. The below software in
* this distribution may have been modified by THL A29 Limited ("Tencent Modifications").
* All Tencent Modifications are Copyright (C) THL A29 Limited.
* nohost-环境配置与抓包调试平台 is licensed under the MIT License except for the third-party components listed below.
*/

import React, { Component } from 'react';
import { Form, Input, Button, Icon, message, Popconfirm } from 'antd';
import Panel from '../../../components/panel';
import { FORM_ITEM_LAYOUT, SUBMIT_BTN_LAYOUT } from '../../util';
import { setDomain } from '../../cgi';

const DOMAIN_TITLE = <span><Icon type="global" /> 设置访问管理页面的域名</span>;

class Domain extends Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, value) => {
      const { domain } = value;
      if (!err) {
        setDomain({ domain: domain.trim() }, (data) => {
          if (!data) {
            message.error('操作失败，请稍后重试');
            return;
          }
          message.success('设置域名成功！');
        });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { value = '' } = this.props;

    return (
      <div className="p-mid-con">
        <Panel title={DOMAIN_TITLE}>
          <Form {...FORM_ITEM_LAYOUT}>
            <Form.Item label="域名">
              {getFieldDecorator('domain', {
                initialValue: value,
                rules: [
                  { max: 128, message: '域名最多不超过128个字符!' },
                  { pattern: /^\s*[\w.,\s-]+\s*$/, message: '请输入正确的域名，多个域名用逗号（,）分隔！' },
                ],
              })(<Input placeholder="请输入一个DNS指向当前服务器的域名" maxLength={128} autoComplete="off" />)}
            </Form.Item>
            <Form.Item {...SUBMIT_BTN_LAYOUT} style={{ marginBottom: 0 }}>
              <Popconfirm
                title="确定修改域名？"
                onConfirm={this.handleSubmit}
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

export default Form.create({ name: 'domain' })(Domain);
