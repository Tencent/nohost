import React, { Component } from 'react';
import { Row, Col, Button, Form, Input } from 'antd';
import PropTypes from 'prop-types';

const FormItem = Form.Item;

class AddNoticeForm extends Component {
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

        this.props.handleSubmit(values.notice);
      }
    });
  };

  // 失去焦点，清除前后空格
  onBlur = ({ target }) => {
    const { id, value } = target;
    this.props.form.setFieldsValue({ [id]: value.trim() });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handelSubmit}>
        <FormItem>
          { getFieldDecorator('notice', {
            initialValue: this.props.notice,
          })(<Input
            disabled={this.state.loading}
            placeholder="请输入通知，最多32个字符"
            maxLength={32}
            autoComplete="off"
            onBlur={this.onBlur}
            allowClear
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

AddNoticeForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  notice: PropTypes.string,
};

AddNoticeForm.defaultProps = {
  notice: '',
};

export default Form.create()(AddNoticeForm);
