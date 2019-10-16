import React, { Fragment } from 'react';

const Panel = ({ title, children }) => (
  <Fragment>
    <h3 className="p-title">{title}</h3>
    <div className="p-mid-ctn">
      {children}
    </div>
  </Fragment>
);

export default Panel;