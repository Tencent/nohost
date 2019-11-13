import React from 'react';

const TabPane = function(props) {
  return (
    <div className={props.className || ''} key={props.tabKey}>
      {props.children}
    </div>
  );
};
export default TabPane;
