import React, { Component } from 'react';

class Tabs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: props.activeKey || props.defaultActiveKey,
    };
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
              const { tab, tabKey } = item.props;
              return (
                <div
                  className={`p-tab ${activeTab === tabKey ? 'p-tab-active' : ''} `}
                  onClick={() => this.handleClick(tabKey)}
                  key={tabKey}
                >
                  {tab}
                </div>
              );
            })
          }
        </div>
        <div className="vbox p-tab-ctn">
          {
            React.Children.map(this.props.children, item => {
              const { tabKey, className } = item.props;
              return (
                <div
                  className={`p-ctn-item ${activeTab === tabKey ? `${className || ''}` : 'p-hide'}`}
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
