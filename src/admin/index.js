import '../base.less';
import './index.css';
import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { parse } from 'query-string';
import NavBar from '../components/navBar';
import Accounts from './accounts';
import Config from './config';
import Certs from './certs';
import Settings from './settings';

const { location } = window;
const query = parse(location.search);
const hideNavBar = query.hideNohostNavBar === 'true';
const TABS = [
  'accounts',
  'config',
  'certs',
  'whistle',
  'system',
];

const subMenu = {
  accounts: 'accounts',
  whistle: 'whistle',
  config: 'config/entrySettings',
  certs: 'certs',
  system: 'system/administrator',
};

const getActive = (active) => {
  active = active.split('/')[0] || query.active || query.name;
  return TABS[TABS.indexOf(active)] || 'accounts';
};

class App extends Component {
  tabStatus = {}

  constructor(props) {
    super(props);
    const active = getActive(location.hash.substring(1));
    this.tabStatus[active] = 1;
    this.state = { active };
  }

  componentDidMount() {
    const changeTab = (name) => {
      if (TABS.indexOf(name) === -1) {
        name = 'accounts';
      }
      this.onTabChange(name);
    };
    try {
      const { onNohostPageReady } = window.parent;
      if (typeof onNohostPageReady === 'function') {
        onNohostPageReady({ changeTab });
      }
    } catch (e) {}
  }

  onTabChange = (active) => {
    this.tabStatus[active] = 1;
    location.hash = subMenu[active];
    this.setState({
      active,
    });
  }

  onConfigChange = (key) => {
    subMenu.config = `config/${key}`;
  }

  onSettingsChange = (key) => {
    subMenu.system = `system/${key}`;
  }

  render() {
    const {
      accounts,
      whistle,
      config,
      certs,
      system,
    } = this.tabStatus;
    const {
      active,
    } = this.state;
    const showWhistle = active === 'whistle';

    return (
      <Fragment>
        <NavBar active={active} onChange={this.onTabChange} hide={hideNavBar} />
        <div className={`fill vbox p-container${showWhistle ? ' p-full-container' : ''}`}>
          { accounts ? <Accounts hide={active !== 'accounts'} /> : null }
          { whistle ? (
            <iframe
              title="全局规则"
              className={`fill capture-win ${showWhistle ? '' : 'p-hide'}`}
              src="whistle/"
            />
          ) : null }
          { config ? <Config onItemChange={this.onConfigChange} hide={active !== 'config'} /> : null }
          { certs ? <Certs hide={active !== 'certs'} /> : null }
          { system ? <Settings onItemChange={this.onSettingsChange} hide={active !== 'system'} /> : null }
        </div>
      </Fragment>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
