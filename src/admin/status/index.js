import './index.css';
import React, { Component } from 'react';

class Status extends Component {
  render() {
    const { hide } = this.props;
    return (
      <div className={`p-status${hide ? ' p-hide' : ''}`}>
        Status
      </div>
    );
  }
}

export default Status;
