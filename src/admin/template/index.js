import './index.css';
import React, { Component } from 'react';

class Template extends Component {
  render() {
    const { hide } = this.props;
    return (
      <div className={`p-template${hide ? ' p-hide' : ''}`}>
        Tempalte
      </div>
    );
  }
}

export default Template;
