import './index.css';
import React, { Component } from 'react';

class Settings extends Component {
  render() {
    const { hide } = this.props;
    return (
      <div className={`box p-settings${hide ? ' p-hide' : ''}`}>
        Settings
      </div>
    );
  }
}

export default Settings;
