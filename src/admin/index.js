import '../base.less';
import './index.css';
import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { parse } from 'query-string';
import NavBar from '../components/navBar';
import Accounts from './accounts';
import Rules from './rules';
import Template from './template';
import Certs from './certs';
import Monitor from './monitor';
import Settings from './settings';

const { location } = window;
const query = parse(location.search);
const TABS = [
  'accounts',
  'rules',
  'template',
  'certs',
  // 'monitor',
  'system',
];

const subMenu = {
  accounts: 'accounts',
  rules: 'rules/entrySetting',
  template: 'template/rulesTemplate',
  certs: 'certs',
  system: 'system/administrator',
};

const getActive = (active) => {
  active = active.split('/')[0] || query.active || query.name;
  return TABS[active] || TABS[TABS.indexOf(active)] || 'accounts';
};

class App extends Component {
  tabStatus = {}

  constructor(props) {
    super(props);
    const active = getActive(location.hash.substring(1));
    this.tabStatus[active] = 1;
    this.state = { active };
  }

  onTabChange = (active) => {
    this.tabStatus[active] = 1;
    this.setState({
      active,
    });
    location.hash = subMenu[active];
  }

  render() {
    const {
      accounts,
      rules,
      template,
      certs,
      monitor,
      system,
    } = this.tabStatus;
    const {
      active,
    } = this.state;

    return (
      <Fragment>
        <NavBar active={active} onChange={this.onTabChange} />
        <div className="fill vbox p-container">
          { accounts ? <Accounts hide={active !== 'accounts'} /> : null }
          { rules ? <Rules hide={active !== 'rules'} /> : null }
          { template ? <Template hide={active !== 'template'} /> : null }
          { certs ? <Certs hide={active !== 'certs'} /> : null }
          { monitor ? <Monitor hide={active !== 'monitor'} /> : null }
          { system ? <Settings hide={active !== 'system'} /> : null }
        </div>
      </Fragment>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
