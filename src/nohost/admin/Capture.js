import React from 'react';
import Upload from '../components/Upload';
import '../base.less';
import './index.css';

const Capture = () => (
  <div className="container fill vbox">
    <Upload />
    <iframe title="抓包界面" className="fill capture-win" src="whistle/" />
  </div>
);

export default Capture;
