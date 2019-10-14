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
import Status from './status';
import Settings from './settings';


const TABS = [
  'accounts',
  'rules',
  'template',
  'certs',
  'status',
  'settings',
];

const getActive = (active) => {
  return TABS[active] || TABS[TABS.indexOf(active)] || 'accounts';
};

class App extends Component {
  tabStatus = {}

  constructor(props) {
    super(props);
    let { active } = parse(location.hash);
    const query = parse(location.search);
    active = getActive(active || query.active || query.name);
    this.tabStatus[active] = 1;
    this.state = { active };
  }

  componentDidMount() {
    window.addEventListener('hashchange', () => {
      const { active } = parse(location.hash);
      this.setState({ active: getActive(active) });
    });
  }

  onTabChange = (active) => {
    this.tabStatus[active] = 1;
    this.setState({
      active,
    });
    location.hash = `active=${active}`;
  }

  render() {
    const {
      accounts,
      rules,
      template,
      certs,
      status,
      settings,
    } = this.tabStatus;
    const {
      active,
    } = this.state;
    return (
      <Fragment>
        <NavBar active={active} onChange={this.onTabChange} />
        <div className="p-container fill">
          { accounts ? <Accounts hide={active !== 'accounts'} /> : null }
          { rules ? <Rules hide={active !== 'rules'} /> : null }
          { template ? <Template hide={active !== 'template'} /> : null }
          { certs ? <Certs hide={active !== 'certs'} /> : null }
          { status ? <Status hide={active !== 'status'} /> : null }
          { settings ? <Settings hide={active !== 'settings'} /> : null }
        </div>
      </Fragment>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
