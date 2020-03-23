import React from 'react';
import ReactDOM from 'react-dom';
import { parse } from 'query-string';
import Upload from '../components/upload';
import { importSessions as getSessions } from './cgi';
import { getString } from './util';
import '../base.less';

let { name, date, username } = parse(window.location.search);
name = getString(name);
date = getString(date);
username = getString(username);

const clearNetwork = name ? '&clearNetwork=true' : '';

const Network = () => {
  return (
    <div className="container fill vbox">
      <Upload />
      <iframe title="network" className="fill capture-win" src={`network/#network?ip=self${clearNetwork}`} />
    </div>
  );
};

const init = () => {
  window.onWhistleReady = (api) => {
    if (!name) {
      return;
    }
    getSessions({
      name,
      date,
      username,
    }, (data) => {
      if (!data) {
        return;
      }
      api.importSessions(data);
    });
  };
  ReactDOM.render(<Network />, document.getElementById('root'));
};

init();
