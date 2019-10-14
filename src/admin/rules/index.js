import './index.css';
import React, { Component } from 'react';

class Rules extends Component {
  render() {
    const { hide } = this.props;
    return (
      <div className={`p-rules${hide ? ' p-hide' : ''}`}>
        Rules
      </div>
    );
  }
}

export default Rules;
