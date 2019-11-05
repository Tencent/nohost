import React from 'react';
import ReactDOM from 'react-dom';
import { parse } from 'query-string';
import Upload from './components/Upload';
import { importSessions as getSessions } from './cgi';
import './base.less';

let { name, date } = parse(window.location.search);
if (typeof name !== 'string') {
  name = '';
}
if (typeof date !== 'string') {
  date = '';
}
const clearNetwork = name ? '&clearNetwork=true' : '';

const Network = () => {
  return (
    <div className="container fill orient-vertical-box">
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
