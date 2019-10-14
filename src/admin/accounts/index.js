import './index.css';
import React, { Component } from 'react';

class Accounts extends Component {
  render() {
    const { hide } = this.props;
    return (
      <div className={`p-accounts${hide ? ' p-hide' : ''}`}>
        Accounts
      </div>
    );
  }
}

export default Accounts;
