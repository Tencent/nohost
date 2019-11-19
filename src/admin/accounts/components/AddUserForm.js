import React, { Component } from 'react';
import { Row, Col, Button, Form, Input } from 'antd';
import PropTypes from 'prop-types';

const FormItem = Form.Item;


class AddUserForm extends Component {
  formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 19 },
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
        this.props.handleSubmit(values);
      }
    });
  };

  checkUser = (rule, value, callback) => {
    this.props.users.forEach((user) => {
      if (user.name === value) {
        callback('已存在该账号名');
      }
    });
    callback();
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
        <FormItem {...this.formItemLayout} label="账号名" hasFeedback>
          { getFieldDecorator('username', {
            rules: [
              { required: true, message: '请输入账号名' },
              { pattern: /^[\w.-]{1,24}$/, message: '只能包含大小写字母、数字、下划线、点或横线' },
              { validator: this.checkUser },
            ],
          })(<Input
            disabled={this.state.loading}
            placeholder="请输入1~24个字母、数字、下划线、点或横线"
            maxLength={24}
            autoComplete="off"
          />)}
        </FormItem>
        <FormItem {...this.formItemLayout} label="密码" hasFeedback>
          { getFieldDecorator('password', {
            rules: [
              { required: true, message: '请输入密码' },
            ],
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

AddUserForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
};

export default Form.create()(AddUserForm);
