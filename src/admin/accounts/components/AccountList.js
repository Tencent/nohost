import React, { Component } from 'react';
import { Row, Col, Button, Form, Input } from 'antd';
import PropTypes from 'prop-types';

const FormItem = Form.Item;


class ModPasswordForm extends Component {
  formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  handelSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        this.props.handleSubmit(values.password);
      }
    });
  };

  checkPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次密码不一致!');
    } else {
      callback();
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handelSubmit}>
        <FormItem {...this.formItemLayout} label="密码" hasFeedback>
          { getFieldDecorator('password', {
            rules: [{ required: true, message: '请输入密码' }],
          })(<Input
            disabled={this.state.loading}
            type="password"
            placeholder="长度在1~24之间"
            maxLength={24}
            autoComplete="off"
          />)}
        </FormItem>
        <FormItem {...this.formItemLayout} label="确认密码" hasFeedback>
          { getFieldDecorator('confirm', {
            rules: [
              { required: true, message: '请再次输入密码' },
              { validator: this.checkPassword },
            ],
          })(<Input
            disabled={this.state.loading}
            type="password"
            placeholder="长度在1~24之间"
            maxLength={24}
            autoComplete="off"
          />)}
        </FormItem>
        <Row>
          <Col span={24} style={{ textAlign: 'center' }}>
            <Button type="primary" htmlType="submit" loading={this.state.loading}>
              提交
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

ModPasswordForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
};

export default Form.create()(ModPasswordForm);
