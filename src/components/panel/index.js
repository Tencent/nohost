import React from 'react';

const Panel = ({ title, children, hide }) => (
  <div className={hide ? 'p-hide' : ''}>
    {title ? <h3 className="p-title">{title}</h3> : undefined}
    <div className="p-mid-ctn">
      {children}
    </div>
  </div>
);

export default Panel;
