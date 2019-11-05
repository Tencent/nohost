/* eslint-disable import/prefer-default-export */
const { location } = window;

export const FORM_ITEM_LAYOUT = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};
export const SUBMIT_BTN_LAYOUT = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 16, offset: 6 },
  },
};

/**
 * 【初始化】根据url hash值，获取已选的tab名
 * @param {STRING} defaultTab 默认tab
 */
export const getActiveTabFromHash = (defaultTab) => {
  const tabName = location.hash.split('/')[1];
  if (!tabName) {
    location.hash = location.hash.replace(/(#.*)/, `$1/${defaultTab}`);
  }
  return tabName || defaultTab;
};

/**
 * 根据已选tab值，设置当前hash
 * @param {STRING} activeTab 选中的tab
 */
export const setActiveHash = (activeTab) => {
  location.hash = location.hash.replace(/(#.*\/).*/, `$1${activeTab}`);
};

/**
 * 按command/control + enter时，自动保存表单
 * @param {Object} e 事件对象
 */
export const isPressEnter = (e) => {
  if (e.type !== 'keydown') {
    return true;
  }
  if ((e.keyCode === 13 || e.keyCode === 83) && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    return true;
  }
};
