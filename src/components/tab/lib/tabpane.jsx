import React from 'react';

const TabPane = function(props) {
  return (
    <div tab={props.tab} key={props.tabKey}>
      {props.children}
    </div>
  );
};
export default TabPane;
