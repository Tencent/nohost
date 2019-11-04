import React, { Component } from 'react';
import { Button, Select, Form, Modal } from 'antd';
import Panel from '../../../components/panel';
import { FORM_ITEM_LAYOUT, SUBMIT_BTN_LAYOUT } from '../../util';
import '../index.css';

const { confirm } = Modal;
class WhiteList extends Component {
  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log(values, '=====');
      }
    });
  }

  handleDeselect = (value) => {
    const that = this;
    const list = that.props.form.getFieldValue('list');
    confirm({
      title: `确定将${value}移除白名单吗?`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onCancel() {
        that.props.form.setFieldsValue({
          list,
        });
      },
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="p-mid-con p-whitelist">
        <Panel title="设置白名单">
          <Form {...FORM_ITEM_LAYOUT} onSubmit={this.handleSubmit}>
            <Form.Item
              label="白名单"
            >
              {getFieldDecorator('list', {
                rules: [{ required: true, message: '请输入白名单！' }],
              })(<Select
                mode="tags"
                placeholder="请输入一个或多个人名，每次输入后按回车即可录入"
                onDeselect={this.handleDeselect}
              />)}
            </Form.Item>
            <Form.Item {...SUBMIT_BTN_LAYOUT} wrapperCol={{ span: 4, offset: 20 }}>
              <Button type="primary" htmlType="submit">
                  保存
              </Button>
            </Form.Item>
          </Form>
        </Panel>
      </div>
    );
  }
}
export default Form.create({ name: 'whiteList' })(WhiteList);
