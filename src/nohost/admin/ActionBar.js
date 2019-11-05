import React from 'react';
import { Button, Icon } from 'antd';

export default (props) => {
  return (
    <div className="n-settings-bar">
      <Button
        onClick={props.onClickHelp}
        size="small"
        style={{ marginRight: 20 }}
      >
        <Icon type="question-circle-o" />
        Help
      </Button>
      {props.onFormat ? (
        <Button
          onClick={props.onFormat}
          size="small"
          style={{ marginRight: 20 }}
        >
          <Icon type="like-o" />
          Format
        </Button>
      ) : undefined}
      <Button
        {...props}
        disabled={props.disabled !== false}
        type="primary"
        size="small"
      >
        <Icon type="save" />
        Save
      </Button>
    </div>
  );
};
