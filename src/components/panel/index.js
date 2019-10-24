import React from 'react';

const Panel = ({ title, children, hide }) => (
  <div className={hide ? 'p-hide' : ''}>
    <h3 className="p-title">{title}</h3>
    <div className="p-mid-ctn">
      {children}
    </div>
  </div>
);

export default Panel;
