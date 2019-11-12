import React, { Component } from 'react';
import { Table, Switch } from 'antd';
import PropTypes from 'prop-types';
import $ from 'jquery';


class UserTable extends Component {
  columns = [
    {
      width: '10%',
      title: '启用',
      key: 'active',
      render: (text, user) => (
        <Switch checked={user.active} data-action="activate" />
      ),
    },
    {
      width: '50%',
      title: '姓名',
      key: 'name',
      dataIndex: 'name',
    },
    {
      width: '40%',
      title: '操作',
      key: 'action',
      render: (text, user) => (
        /* eslint-disable*/
        <span className="nohost-user-operation">
          <a style={{ marginRight: 20 }} href={`data.html?name=${user.name}`} target="_blank">抓包配置</a>
          <a style={{ marginRight: 20 }} data-action="modify">修改密码</a>
          <a data-action="delete">删除</a>
        </span>
        /* eslint-enable */
      ),
    },
  ];

  addDragable = () => {
    this.tbody = document.getElementsByClassName('ant-table-tbody')[0];
    this.rows = Array.prototype.slice.apply(this.tbody.getElementsByClassName('ant-table-row'));
  }

  componentDidUpdate = () => {
    this.addDragable();
    $(document).on('mouseenter', '.ant-table-row td', (e) => {
      const target = $(e.target).closest('td');
      this.setDraggable(!target.find('.ant-switch').length);
    });
    $(document).on('mouseleave', '.ant-table-row td', () => {
      this.setDraggable(false);
    });
  }

  handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('index', this.rows.indexOf(e.target));
  };

  handleDragOver = (e) => {
    e.preventDefault();
  }

  handleDragEnter = (e) => {
    const row = e.target.parentElement;
    if (this.rows.indexOf(row) !== -1) {
      row.style.backgroundColor = '#e9e9e9';
    }
  };

  handleDragLeave = (e) => {
    const row = e.target.parentElement;
    if (this.rows.indexOf(row) !== -1) {
      row.style.backgroundColor = '';
    }
  };

  handleDrop = (e) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('index'), 10);
    const row = e.target.parentElement;
    const toIndex = this.rows.indexOf(row);
    if (toIndex === -1) {
      return;
    }
    row.style.backgroundColor = '';
    this.props.onDrag(fromIndex, toIndex);
  };

  handleClick = (record, index, e) => {
    const action = e.target.getAttribute('data-action');
    const { name } = record;
    switch (action) {
      case 'activate':
        this.props.onActivate(name, index, !e.target.checked);
        break;
      case 'modify':
        this.props.onModify(name);
        break;
      case 'delete':
        this.props.onDelete(name);
        break;
      default:
        return;
    }
    e.preventDefault();
  }

  setDraggable = (draggable) => {
    this.rows.forEach((row) => {
      row.setAttribute('draggable', draggable !== false);
    });
  }

  render() {
    return (
      <div
        onDragStart={this.handleDragStart}
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
      >
        <Table
          size="middle"
          dataSource={this.props.users}
          columns={this.columns}
          rowKey="name"
          pagination={false}
          onRow={(record, index) => {
            return {
              onClick: event => this.handleClick(record, index, event), // 点击行
            };
          }}
          bordered
        />
      </div>
    );
  }
}

UserTable.propTypes = {
  users: PropTypes.array.isRequired,
  onActivate: PropTypes.func.isRequired,
  onModify: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDrag: PropTypes.func.isRequired,
};


export default UserTable;
