import React, { Component } from 'react';

class Tabs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: props.activeKey || props.defaultActiveKey,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { activeKey } = props;
    if (activeKey !== state.activeTab) {
      return {
        activeTab: activeKey,
      };
    }
    return null;
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
        <div className="p-tab-ctn">
          {
            React.Children.map(this.props.children, item => {
              const { tabKey } = item.props;
              return (
                <div
                  className={`p-ctn-item ${activeTab === tabKey ? '' : 'p-hide'}`}
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
