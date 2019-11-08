import React, { Component } from 'react';
import { Modal, Input, Button, Table, message } from 'antd';
import $ from 'jquery';
import Clipboard from 'clipboard';
import { exportSessions } from '../../admin/cgi';
import './index.css';

const REL_URL = window.location.href.replace(/[^/]*([?#].*)?$/, '');

const initClipbord = () => {
  const clipboard = new Clipboard('.n-copy-text');
  clipboard.on('error', () => message.error('复制失败'));
  clipboard.on('success', () => message.success('复制成功'));
};

initClipbord();

/* eslint-disable jsx-a11y/anchor-is-valid, no-script-url */
const columns = [{
  title: 'Date',
  dataIndex: 'date',
  key: 'date',
  width: 120,
  render: date => (
    [date.substring(0, 4), date.substring(4, 6), date.substring(6, 8)].join('-')
  ),
}, {
  title: 'Name',
  dataIndex: 'name',
  key: 'name',
  render: (text, { name, url }) => (
    <a
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      {name}
    </a>
  ),
}, {
  title: 'Action',
  key: 'action',
  width: 160,
  render: (text, { url }) => (
    [
      <a
        href={url}
        rel="noopener noreferrer"
        target="_blank"
      >
        打开
      </a>,
      <a
        style={{ marginLeft: 10 }}
        className="n-copy-text"
        draggable={false}
        data-clipboard-text={url}
      >
        复制URL
      </a>,
    ]
  ),
}];

const getExportList = () => {
  let list = localStorage.exportInfoList;
  try {
    list = JSON.parse(list);
    if (Array.isArray(list)) {
      return list.filter(item => item && item.name && item.date);
    }
  } catch (e) {}
};

class Uploader extends Component {
  state = { exportInfo: [] }

  componentDidMount() {
    window.uploadWhistleSessions = (sessions) => {
      this.setState({
        visible: true,
        errorTips: '',
        disabled: false,
        sessions,
      }, () => setTimeout(this.focusInput, 200));
    };
    const btn = $('<div class="n-show-export-info" title="查看本机上传数据包列表"></div>');
    btn.appendTo(document.body);
    btn.click(this.showExportList);
  }

  onChange = (e) => {
    this.setState({ name: e.target.value, errorTips: '' });
  }

  handleOk = () => {
    let { name, sessions } = this.state;
    if (!sessions) {
      return;
    }
    name = (name && name.replace(/\s+/g, '')) || `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    this.setState({ disabled: true });
    exportSessions({
      name,
      sessions: JSON.stringify(sessions),
    }, (result, xhr) => {
      this.setState({ disabled: false });
      if (result.ec === 1) {
        this.setState({ errorTips: '该名称已存在，请重新修改。' });
        this.focusInput();
        return;
      }
      if (!result || result.ec !== 0) {
        this.setState({ errorTips: (xhr && xhr.status) === 413 ? '导出数据太多！' : '操作失败，请稍后再试！' });
        return;
      }
      this.saveExportList(name, result.date);
      this.setState({
        visible: false,
        errorTips: '',
        name: '',
        sessions: '',
      }, this.showExportList);
    });
  }

  handleCancel = () => {
    if (this.setState.disabled) {
      return;
    }
    this.setState({
      visible: false,
    });
  }

  saveExportList = (name, date) => {
    let list = getExportList() || [];
    list.push({ name, date });
    if (list.length > 100) {
      list = list.slice(-100);
    }
    localStorage.exportInfoList = JSON.stringify(list);
  }

  showExportList = (e) => {
    const exportInfo = [];
    const list = getExportList();
    if (list) {
      list.reverse().forEach(({ name, date }) => {
        const url = `${REL_URL}network.html?name=${encodeURIComponent(name)}&date=${date}`;
        exportInfo.push({ name, date, url });
      });
    }
    this.setState({
      exportInfo,
      hasNewItem: !e,
      showExportList: true,
    });
  }

  focusInput = () => {
    if (!this.nameInput) {
      return;
    }
    this.nameInput.focus();
  }

  render() {
    const {
      visible,
      name,
      errorTips,
      disabled,
      exportInfo,
      showExportList,
      hasNewItem,
    } = this.state;
    return (
      <div>
        <Modal
          title="Export Sessions"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[
            <Button disabled={disabled} onClick={this.handleCancel}>Cancel</Button>,
            <Button
              onClick={this.handleOk}
              type="primary"
              disabled={disabled}
            >
              OK
            </Button>,
          ]}
        >
          <Input
            ref={input => (this.nameInput = input)}
            placeholder="请输入文件名称"
            maxLength={24}
            value={name}
            onPressEnter={this.handleOk}
            onChange={this.onChange}
          />
          <p
            className="n-error-tips"
            style={{ display: errorTips ? 'block' : 'none' }}
          >
            {errorTips}
          </p>
        </Modal>
        <Modal
          className="n-export-list-modal"
          title="Export List"
          visible={showExportList}
          width={600}
          onCancel={() => this.setState({ showExportList: false })}
          footer={null}
        >
          <Table
            className={hasNewItem ? 'n-has-new-item' : undefined}
            pagination={false}
            columns={columns}
            dataSource={exportInfo}
          />
        </Modal>
      </div>
    );
  }
}

export default Uploader;
