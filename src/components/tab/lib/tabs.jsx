import React, { Component } from 'react';

class Tabs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: props.activeKey || props.defaultActiveKey,
    };
  }

  componentWillReceiveProps(props) {
    const { activeKey } = props;
    if (activeKey !== this.state.activeTab) {
      this.setState({
        activeTab: activeKey,
      });
    }
  }

  handleClick = (key) => {
    if (key !== this.state.activeTab) {
      this.setState({
        activeTab: key,
      });
      this.props.onChange(key);
    }
  }

  render() {
    const { activeTab } = this.state;

    return (
      <div className="p-tabs-container">
        <div className="p-tabs">
          {
            React.Children.map(this.props.children, item => {
              const { tab } = item.props;
              const { key } = item;
              return (
                <div
                  className={`p-tab ${activeTab === key ? 'p-tab-active' : ''} `}
                  onClick={() => this.handleClick(key)}
                  key={item.key}
                >
                  {tab}
                </div>
              );
            })
          }
        </div>
        <div className="p-tab-ctn">
          {
            React.Children.map(this.props.children, item => {
              const { key } = item;
              return (
                <div
                  className={`p-ctn-item ${activeTab === key ? '' : 'p-hide'}`}
                >
                  {item}
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}
export default Tabs;
