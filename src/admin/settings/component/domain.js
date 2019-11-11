import React, { Component } from 'react';
import { Form, Input, Button, message } from 'antd';
import Panel from '../../../components/panel';
import { FORM_ITEM_LAYOUT, SUBMIT_BTN_LAYOUT } from '../../util';
import { setDomain } from '../../cgi';

class Domain extends Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, value) => {
      const { domain } = value;
      if (!err) {
        setDomain({ domain }, (data) => {
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
        <Panel title="设置域名">
          <Form {...FORM_ITEM_LAYOUT} onSubmit={this.handleSubmit}>
            <Form.Item label="域名">
              {getFieldDecorator('domain', {
                initialValue: value,
                rules: [
                  { required: true, message: '请输入域名，多个域名以逗号或空格分隔!' },
                  { max: 256, message: '域名最多不超过256个字符!' },
                ],
              })(<Input placeholder="请输入域名，如果有多个域名可用,分开" maxLength={256} autoComplete="off" />)}
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

export default Form.create({ name: 'domain' })(Domain);
