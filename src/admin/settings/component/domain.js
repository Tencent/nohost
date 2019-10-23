import React, { Component } from 'react';
import { Icon, Form, Input, Button } from 'antd';
import Panel from '../../../components/panel';

class Domain extends Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    return (
      <Panel title="设置域名">
        <div className="p-action-bar">
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <Form.Item>
              {getFieldDecorator('domain', {
                rules: [{ required: true, message: '请输入域名!' }],
              })(<Input
                prefix={<Icon type="global" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="请输入域名"
              />)}
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Panel>
    );
  }
}

export default Form.create({ name: 'domain' })(Domain);
