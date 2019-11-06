import React, { Component } from 'react';
import { Button, Modal, message } from 'antd';
import $ from 'jquery';
import UserTable from './UserTable';
import AddUserForm from './AddUserForm';
import AccountList from '../components/AccountList';
import { openHelp, openSelect } from './util';
import './index.css';

const MAX_USER_COUNT = 120;

const style = {
  card: {
    minHeight: '512px',
  },
  buttonRow: {
    lineHeight: '80px',
    textAlign: 'right',
  },
};
/* eslint-disable react/no-access-state-in-setstate */
class Accounts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      addUserModal: false,
      modUserModal: false,
      deleteUserModal: false,
      deleteLoading: false,
      chosenUser: '',
    };
  }

  componentWillMount() {
    this.fetchAccounts();
  }

  fetchAccounts = () => {
    $.get({
      url: 'cgi-bin/admin/all-accounts',
      dataType: 'json',
      cache: false,
      success: (data) => {
        if (data.ec) {
          message.error('获取用户数据失败');
        }
        this.setState({
          users: data.list.map(({ name, active }) => {
            return {
              name,
              active,
            };
          }),
        });
      },
      error() {
        message.error('获取用户数据失败');
      },
    });
  }

  showAddModal = () => {
    if (this.state.users.length > MAX_USER_COUNT) {
      message.error(`用户数不能超过 ${MAX_USER_COUNT} 个`);
      return false;
    }
    this.setState({ addUserModal: true });
  };

  hideAddModal = () => this.setState({ addUserModal: false });

  handleAddSubmit = ({ username, password }) => {
    $.post({
      url: 'cgi-bin/admin/add-account',
      dataType: 'json',
      data: {
        name: username,
        password,
      },
      success: (data) => {
        this.hideAddModal();
        if (data.ec) {
          message.error(`添加用户失败，错误码${data.ec} ${data.em}`);
        } else {
          message.success(`${username}添加成功`);
          this.fetchAccounts();
        }
      },
      error() {
        message.error('添加用户失败，网络错误');
      },
    });
  };

  hideModModal = () => this.setState({ modUserModal: false });

  beforeModSubmit = username => this.setState({
    modUserModal: true,
    chosenUser: username,
  });

  handleModSubmit = (password) => {
    $.post({
      url: 'cgi-bin/admin/change-password',
      dataType: 'json',
      data: {
        name: this.state.chosenUser,
        password,
      },
      success: (data) => {
        this.hideModModal();
        if (data.ec) {
          message.error(`修改用户$${this.state.chosenUser}密码失败，错误码${data.ec} ${data.em}`);
        } else {
          message.success(`修改用户${this.state.chosenUser}密码成功`);
        }
      },
      error: () => {
        this.hideDeleteModal();
        message.error(`修改用户${this.state.chosenUser}密码失败，网络错误`);
      },
    });
  };

  handleActivateSubmit = (name, index, active) => {
    const newUsers = [...this.state.users];
    newUsers[index].active = active;
    this.setState({ users: newUsers });
    $.post({
      url: 'cgi-bin/admin/active-account',
      dataType: 'json',
      data: {
        name,
        active,
      },
      success: (data) => {
        if (data.ec) {
          message.error(`切换${name}状态失败，错误码${data.ec} ${data.em}`);
          newUsers[index].active = !active;
          this.setState({ users: newUsers });
        } else {
          message.success(`切换${name}状态成功`);
        }
      },
      error: () => {
        message.error('切换用户状态失败，网络错误');
        newUsers[index].active = !active;
        this.setState({ users: newUsers });
      },
    });
  };

  hideDeleteModal = () => this.setState({
    deleteUserModal: false,
    deleteLoading: false,
  });

  beforeDeleteSubmit = username => this.setState({
    deleteUserModal: true,
    chosenUser: username,
  });

  handleDeleteSubmit = () => {
    this.setState({ deleteLoading: true });
    $.post({
      url: 'cgi-bin/admin/remove-account',
      dataType: 'json',
      data: {
        name: this.state.chosenUser,
      },
      success: (data) => {
        this.hideDeleteModal();
        if (data.ec) {
          message.error(`删除用户失败，错误码${data.ec} ${data.em}`);
        } else {
          message.success(`${this.state.chosenUser}删除成功`);
          this.fetchAccounts();
        }
      },
      error: () => {
        this.hideDeleteModal();
        message.error('删除用户失败，网络错误');
      },
    });
  };

  handleDrag = (fromIndex, toIndex) => {
    const users = [...this.state.users];
    const fromUser = users[fromIndex];
    const toUser = users[toIndex];
    users.splice(fromIndex, 1);
    users.splice(toIndex, 0, fromUser);
    this.setState({ users });
    $.post({
      url: 'cgi-bin/admin/move',
      dataType: 'json',
      data: {
        fromName: fromUser.name,
        toName: toUser.name,
      },
      success: (data) => {
        if (data.ec) {
          message.error(' 网络异常');
        }
      },
      error: () => {
        message.error(' 网络异常');
      },
    });
  };

  render() {
    return (
      <div style={{ width: 1024, margin: '0 auto 20px' }}>
        <div style={style.buttonRow}>
          <Button onClick={openHelp} style={{ marginRight: 20 }} icon="question">帮助</Button>
          <Button onClick={openSelect} style={{ marginRight: 20 }} icon="select">切换环境</Button>
          <Button
            disabled={this.state.users.length > MAX_USER_COUNT}
            type="primary"
            icon="plus"
            onClick={this.showAddModal}
          >添加用户
          </Button>
        </div>
        <UserTable
          users={this.state.users}
          onDelete={this.beforeDeleteSubmit}
          onActivate={this.handleActivateSubmit}
          onModify={this.beforeModSubmit}
          onDrag={this.handleDrag}
        />
        {/* 添加用户弹窗 */}
        <Modal
          title="添加用户"
          visible={this.state.addUserModal}
          onCancel={this.hideAddModal}
          footer={null}
        >
          <AddUserForm key={Date.now()} handleSubmit={this.handleAddSubmit} users={this.state.users} />
        </Modal>
        {/* 修改用户密码弹窗 */}
        <Modal
          title="修改用户密码"
          visible={this.state.modUserModal}
          onCancel={this.hideModModal}
          footer={null}
        >
          <AccountList key={Date.now()} handleSubmit={this.handleModSubmit} />
        </Modal>
        {/* 删除用户弹窗 */}
        <Modal
          title="删除用户"
          visible={this.state.deleteUserModal}
          onCancel={this.hideDeleteModal}
          onOk={this.handleDeleteSubmit}
          confirmLoading={this.state.deleteLoading}
        >
          确定要删除用户{this.state.chosenUser}吗？
        </Modal>
      </div>
    );
  }
}

export default Accounts;
