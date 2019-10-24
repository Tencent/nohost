import React, { Component } from 'react';
import { Input, Tag, Icon, Button } from 'antd';
import { TweenOneGroup } from 'rc-tween-one';
import Panel from '../../../components/panel';
import '../index.css';

class WhiteList extends Component {
  state = {
    tags: ['Aven', 'Jero'],
    inputVisible: false,
    inputValue: '',
  };

  handleClose = removedTag => {
    this.setState((state) => {
      const tags = state.tags.filter(tag => tag !== removedTag);
      return {
        tags,
      };
    });
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    let { tags } = this.state;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    this.setState({
      tags,
      inputVisible: false,
      inputValue: '',
    });
  };

  handleSubmit = () => {
    console.log(this.state.tags, '=====');
  }

  saveInputRef = input => (this.input = input);

  forMap = tag => {
    const tagElem = (
      <Tag
        closable
        onClose={e => {
          e.preventDefault();
          this.handleClose(tag);
        }}
      >
        {tag}
      </Tag>
    );
    return (
      <span key={tag} style={{ display: 'inline-block' }}>
        {tagElem}
      </span>
    );
  };

  render() {
    const { tags, inputVisible, inputValue } = this.state;
    const tagChild = tags.map(this.forMap);

    return (
      <div className="p-mid-con p-whitelist">
        <Panel title="设置白名单">
          <TweenOneGroup
            enter={{
              scale: 0.8,
              opacity: 0,
              type: 'from',
              duration: 100,
              onComplete: e => {
                e.target.style = '';
              },
            }}
            className="tag-container"
            leave={{ opacity: 0, width: 0, scale: 0, duration: 200 }}
            appear={false}
          >
            {inputVisible && (
            <Input
              ref={this.saveInputRef}
              type="text"
              size="small"
              className="edit-input"
              value={inputValue}
              onChange={this.handleInputChange}
              onBlur={this.handleInputConfirm}
              onPressEnter={this.handleInputConfirm}
            />
            )}
            {!inputVisible && (
            <Tag className="edit-tag" onClick={this.showInput}>
              <Icon type="plus" /> 新增
            </Tag>
            )}
            {tagChild}
          </TweenOneGroup>
          <Button type="primary" className="submit-btn" onClick={this.handleSubmit}>
              确定
          </Button>
        </Panel>
      </div>
    );
  }
}

export default WhiteList;
