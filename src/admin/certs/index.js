import './index.css';
import React, { Component } from 'react';

class Certs extends Component {
  render() {
    const { hide } = this.props;
    return (
      <div className={`p-certs${hide ? ' p-hide' : ''}`}>
        Certs
      </div>
    );
  }
}

export default Certs;
