import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import qrcode from 'qrcode';


class QRCode extends Component {
  componentDidMount() {
    /* eslint-disable react/no-find-dom-node, react/no-string-refs */
    this.canvas = ReactDOM.findDOMNode(this.refs.canvas);
    this.updateQRCode();
  }

  componentWillUpdate(nextProps) {
    const update = nextProps.value !== this.props.value;
    if (update) {
      this.updateQRCode(nextProps.value);
    }
    return update;
  }

  updateQRCode(value) {
    value = value || this.props.value;
    if (value) {
      let { size } = this.props;
      size = size > 0 ? size : 128;
      qrcode.toCanvas(this.canvas, value, {
        width: size,
        scale: 1,
        margin: 0,
      });
    }
  }

  render() {
    const { value } = this.props;
    return (
      <canvas
        ref="canvas"
        style={{ visibility: value ? 'visible' : 'hidden' }}
      />
    );
  }
}

export default QRCode;
