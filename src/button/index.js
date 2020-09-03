import $ from 'jquery';
import ClipboardJS from 'clipboard';
import tpl from './tpl';
import getEnvData from './getEnvdata';
import {
  clearCookie,
  clearStorage,
  reloadPage,
  checkKeyword,
  scrollToView,
  getLocalStorage,
  setLocalStorage,
} from './helper';
import './index.css';

let curEnvData;
let curEnvDataCallback;
let curEnv;
let userList;
let selectedUser;
let newData;
let selectModal;
let operationModal;
let circle;
let circleIcon;
let circleContext;
let circleEnv;
let circleLast;
let circleDefault;
let filter;
let userUl;
let envUl;
let filterUl;
let topBtn;
let toast;
let timer;
let inited = false; // 是否已展示当前环境
let touching = false; // 是否触摸小圆点
const bound = 20; // 判断小圆点是否移动的上界
let circleMoved = false; // 小圆点是否移动
let envSelected = false; // 是否已选择环境
let startPoint = { x: null, y: null }; // 小圆点开始坐标
const CUR_SELECTED_USER = '__nohost_-_selected_user_id__';
const LAST_SELECTED_ENV = '__nohost_-_last_selected_id__';
// const CIRCLE_POS_X = '__nohost_-_circle_pos_x__';
// const CIRCLE_POS_Y = '__nohost_-_circle_pos_y__';
let customEntry;
let customContext;
let customEntryBtn;
let customModal;

const TEMP_ELEM = $(document.createElement('div'));
const hideNohostBtn = /[?#&]nohost=hide(?:[?#&]|$)/.test(window.location.href);
const escape = (str) => {
  return TEMP_ELEM.text(str).html();
};

const TOAST_DURATION = 1500;

function showContextMenu() {
  if (userList && selectModal.css('display') === 'none' && $(window).width() > 750) {
    circleContext.show();
  }
}

function getEnvLink() {
  let link = `${curEnvData.baseUrl}redirect?url=${encodeURIComponent(window.location.href)}`;
  if (curEnv) {
    if (curEnv.name) {
      link += `&name=${encodeURIComponent(curEnv.name)}`;
    }
    if (curEnv.envName) {
      link += `&env=${encodeURIComponent(curEnv.envName)}`;
    }
  }
  return link;
}

function getData() {
  $.ajax({
    url: '/...whistle-path.5b6af7b9884e1165...///whistle.nohost/cgi-bin/list',
    type: 'json',
    method: 'get',
    cache: false,
    error: () => {
      if (!inited) {
        setTimeout(getData, 1000);
      }
    },
    success: (data) => {
      curEnvData = data;
      newData = getEnvData(data);
      if (curEnvDataCallback) {
        curEnvDataCallback(data);
      }
    },
  });
}

function showSuccessToast(message, duration) {
  selectModal.hide();
  toast.removeClass('w-nohost-toast-error');
  toast.removeClass('w-nohost-toast-countdown');
  toast.find('.w-nohost-toast-content').text(message);
  toast.show();
  if (duration > 0) {
    setTimeout(() => {
      toast.hide();
    }, duration);
  }
}

function showErrorToast(message, duration) {
  selectModal.hide();
  toast.removeClass('w-nohost-toast-countdown');
  toast.addClass('w-nohost-toast-error');
  toast.find('.w-nohost-toast-content').text(message);
  toast.show();
  if (duration > 0) {
    setTimeout(() => {
      toast.hide();
    }, duration);
  }
}

function clearTimer() {
  clearTimeout(timer);
  timer = null;
}

function inUserList(lastEnvStr) {
  if (!newData || !lastEnvStr || typeof lastEnvStr !== 'string'
    || !newData.userList || lastEnvStr.indexOf('/') < 0) {
    return false;
  }
  const lastEnvArr = lastEnvStr.split('/');
  for (let i = 0; i < newData.userList.length; i++) {
    const user = newData.userList[i];
    if (user.name === lastEnvArr[0]) {
      for (let j = 0; j < user.envList.length; j++) {
        const env = user.envList[j];
        if (env.name === lastEnvArr[1]) {
          return true;
        }
      }
    }
  }
  return false;
}

function showEnv(username, envName) {
  if (inited || hideNohostBtn) {
    return;
  }
  const curEnvStr = `${username ? `${username}/` : ''}${envName}`;
  const curEnvName = `当前环境: ${curEnvStr}`;
  showSuccessToast(curEnvName, TOAST_DURATION);
  topBtn.attr('title', curEnvName);
  circleEnv.text(curEnvName);
  circleEnv.attr('data-clipboard-text', `Nohost环境：${curEnvStr}`);
  $('#w-nohost-circle-copyUrl').attr('data-clipboard-text', getEnvLink());
  const lastEnvStr = getLocalStorage(LAST_SELECTED_ENV);
  if (lastEnvStr && lastEnvStr !== curEnvStr && inUserList(lastEnvStr)) {
    circleLast.text(`上一环境: ${lastEnvStr}`);
    circleLast.show();
  } else {
    circleLast.hide();
  }
  if (username) {
    circleDefault.show();
  } else {
    circleDefault.hide();
  }
  inited = true;
}

function filterEnvs(filterWord) {
  const newList = document.createDocumentFragment();
  filterWord = filterWord && filterWord.split(/\s+/);
  newData.userList.forEach((user) => {
    if (!user.envList) {
      const li = document.createElement('li');
      li.id = `__nohost_-_${user.name}`;
      li.innerHTML = '正式环境';
      // 高亮已被选择的环境
      if (curEnv === '~' || !curEnv) {
        li.className = 'envSelected';
      }
      newList.appendChild(li);
      return;
    }
    user.envList.forEach((env) => {
      if (!checkKeyword(`${user.name}/${env.name}`, filterWord)) {
        return;
      }
      const li = document.createElement('li');
      li.innerHTML = escape(`${user.name} / ${env.name}`);
      li.setAttribute('data-user-name', user.name);
      li.setAttribute('data-env-name', env.name);
      li.setAttribute('data-env-id', env.id);
      // 高亮选择的块
      if (curEnv && user.name === curEnv.name) {
        // 选择的是默认环境
        if (!curEnv.envName) {
          if (!env.id) {
            li.className = 'envSelected';
          }
        } else if (env.name === curEnv.envName) {
          li.className = 'envSelected';
        }
      }
      newList.appendChild(li);
    });
  });
  filterUl.html(newList);
}

function genUserList() {
  if (newData) {
    curEnv = newData.curEnv;
    userList = newData.userList;
  }
  if (!inited) {
    if (!userList) {
      circleIcon.addClass('w-nohost-loading-circle');
      setTimeout(genUserList, 500);
      return;
    }
    circleIcon.removeClass('w-nohost-loading-circle')
      .addClass('w-nohost-loaded-circle');
  }
  const newList = document.createDocumentFragment();
  userList.forEach((user, index) => {
    const li = document.createElement('li');
    li.setAttribute('data-index', index.toString());
    li.id = `__nohost_-_${user.name}`;
    li.innerHTML = escape(user.name);
    // 高亮已被选择的环境
    // 正式环境
    if (index === 0 && (curEnv === '~' || !curEnv)) {
      $(li).addClass('envSelected');
      showEnv('', '正式环境');
    } else if (curEnv && curEnv.name === user.name) {
      $(li).addClass('envSelected');
      li.innerHTML = escape(`${user.name}(${curEnv.envName || '默认环境'})`);
      showEnv(user.name, curEnv.envName || '默认环境');
    }
    if (index !== 0) {
      $(li).addClass('liWithSub');
    }

    newList.appendChild(li);
  });
  userUl.html(newList);
}

function setTop(elem) {
  elem = $(elem);
  let top = Math.floor(($(document).height() - elem.height()) / 2) - 10;
  if (top <= 0) {
    top = 20;
  } else if (top > 100) {
    top = 100;
  }
  elem.css('margin-top', top);
}

function showSelectModal() {
  selectModal.show();
  setTop('#w-nohost-list');
}

function showUserList(e) {
  operationModal.hide();
  showSelectModal();
  if (!filter.val().trim()) {
    userUl.show();
    envUl.hide();
    topBtn.removeClass('back').text(topBtn.attr('title'));
  } else {
    filter.focus();
  }
  genUserList();
  if (!e) {
    scrollToView($('#w-nohost-user-ul .envSelected'), true);
  }
  return false;
}

function genEnvList(user) {
  const newList = document.createDocumentFragment();
  user.envList.forEach((env) => {
    const li = document.createElement('li');
    li.innerHTML = escape(env.name);
    li.setAttribute('data-user-name', user.name);
    li.setAttribute('data-env-name', env.name);
    li.setAttribute('data-env-id', env.id);
    // 高亮选择的块
    if (curEnv && user.name === curEnv.name) {
      // 选择的是默认环境
      if (!curEnv.envName) {
        if (!env.id) {
          li.className = 'envSelected';
        }
      } else if (env.name === curEnv.envName) {
        li.className = 'envSelected';
      }
    }
    newList.appendChild(li);
  });
  envUl.html(newList);
}

function showEnvList(user) {
  userUl.hide();
  envUl.show();
  genEnvList(user);
  topBtn.addClass('back').text(`返回账号列表 / ${user.name}`);
  scrollToView($('#w-nohost-env-ul .envSelected'), true);
}

function handleClickModal(event) {
  circleIcon.removeClass('active');
  if (event.target === selectModal[0]) {
    selectModal.hide();
  }
  if (event.target === operationModal[0]) {
    operationModal.hide();
  }
  if (event.target === customModal[0]) {
    customModal.hide();
  }
}

function sendSelect(data, callback) {
  if (curEnv && curEnv.name && curEnv.envName) {
    setLocalStorage(LAST_SELECTED_ENV, `${curEnv.name}/${curEnv.envName}`);
  }
  data = data || { name: '~' };
  selectModal.hide();
  envSelected = true;
  callback = callback || window.onNohostEnvChange;
  const _reloadPage = (succ) => {
    if (typeof callback !== 'function') {
      showSuccessToast(`${succ ? '环境切换成功，' : ''}等待页面重新加载 ...`);
      reloadPage();
      return;
    }
    callback(data, msg => {
      showSuccessToast(msg);
      reloadPage();
    });
  };
  $.ajax({
    url: '/...whistle-path.5b6af7b9884e1165...///whistle.nohost/cgi-bin/select',
    data: {
      name: data.name,
      envId: data.envId,
      time: Date.now(),
    },
    timeout: 3000,
    error() {
      _reloadPage();
    },
    success(result) {
      _reloadPage(result.ec === 0);
    },
  });
}

function handleChooseUser(e) {
  const { target } = e;
  if (target.nodeName !== 'LI') {
    return;
  }
  const index = target.getAttribute('data-index');
  if (index === '0') {
    sendSelect({
      name: '~',
    });
  } else {
    selectedUser = userList[index];
    if (!filter.val().trim()) {
      showEnvList(selectedUser);
    }
    setLocalStorage(CUR_SELECTED_USER, `__nohost_-_${selectedUser.name}`);
  }
  return false;
}

function handleChooseEnv(event) {
  if (event.target.tagName !== 'LI') {
    return;
  }
  const { target } = event;
  const name = target.getAttribute('data-user-name');
  const envId = target.getAttribute('data-env-id');
  sendSelect({ name, envId });
  return false;
}

window.__nohostAPI = {
  switchEnv: sendSelect,
  getEnvData: (callback) => {
    if (typeof callback === 'function') {
      curEnvDataCallback = callback;
      if (curEnvData) {
        callback(curEnvData);
      }
    }
  },
};

function openCurrentUser() {
  circleContext.hide();
  let link = `${curEnvData.baseUrl}data.html`;
  if (curEnv) {
    if (curEnv.name) {
      link += `?name=${encodeURIComponent(curEnv.name)}`;
    }
    if (curEnv.envName) {
      link += `&env=${encodeURIComponent(curEnv.envName)}`;
    }
  }
  window.open(link);
}

function circleWillMove() {
  // 已选择环境则不响应
  if (envSelected) {
    return;
  }
  touching = true;
  startPoint = {
    x: circle.position().left,
    y: circle.position().top,
  };
}

function showOperationModal() {
  if (!selectModal.is(':visible')) {
    operationModal.show();
    setTop('#w-nohost-operations');
    $('#w-nohost-copy-env').attr('data-clipboard-text', circleEnv.attr('data-clipboard-text'));
    $('#w-nohost-copy-location').attr(
      'data-clipboard-text',
      $('#w-nohost-circle-copyUrl').attr('data-clipboard-text')
    );
  }
}
function handleLongTouchInMobile() {
  circleIcon.removeClass('active');
  timer = setInterval(showOperationModal, 800);
}

function handleTouchInMobile() {
  circleWillMove();
  handleLongTouchInMobile();
}

function calPosX(x) {
  const maxWidth = $(window).width() - circleIcon.width();
  let posX = x - window.scrollX - (circleIcon.width() / 2);
  if (posX < 0) {
    posX = 0;
  } else if (posX > maxWidth) {
    posX = maxWidth;
  }
  return Math.abs(posX - startPoint.x) > bound ? posX : startPoint.x;
}

function calPosY(y) {
  const maxHeight = $(window).height() - circleIcon.height();
  let posY = y - window.scrollY - (circleIcon.width() / 2);
  if (posY < 0) {
    posY = 0;
  } else if (posY > maxHeight) {
    posY = maxHeight;
  }
  return Math.abs(posY - startPoint.y) > bound ? posY : startPoint.y;
}

function setCirclePosition(x, y) {
  circle.css('left', `${x}px`);
  circle.css('top', `${y}px`);
  circle.css('right', 'unset');
  circle.css('bottom', 'unset');
}

function handleMoveInMobile(e) {
  if (!touching) {
    return;
  }
  const pageX = calPosX(e.touches[0].pageX);
  const pageY = calPosY(e.touches[0].pageY);
  setCirclePosition(pageX, pageY);
  if ((circle.position().left - startPoint.x) ** 2 + (circle.position().top - startPoint.y) ** 2 > bound ** 2) {
    clearTimer();
  }
}

function handleMoveInPC(e) {
  if (!touching) {
    return;
  }
  setCirclePosition(calPosX(e.pageX), calPosY(e.pageY));
  e.preventDefault();
}

function handleCircleMoved() {
  if (!touching) {
    return;
  }
  touching = false;
  circleMoved = true;
  /* eslint-disable no-restricted-properties */
  // 轻微移动时，展现环境选择界面
  if ((circle.position().left - startPoint.x) ** 2 + (circle.position().top - startPoint.y) ** 2 < bound ** 2) {
    circleMoved = false;
    setCirclePosition(startPoint.x, startPoint.y);
  }
}

function handleMoveEndInMobile() {
  handleCircleMoved();
  if (operationModal.is(':visible') || selectModal.is(':visible')) {
    circleIcon.addClass('active'); // 结束长按
  }
  clearTimer();
}

function toggleModal() {
  // 已选择环境或者环境列表为空则不响应
  if (envSelected || !userList) {
    return;
  }
  circleContext.hide();
  if (selectModal.is(':visible')) {
    selectModal.hide();
    circleIcon.removeClass('active');
  } else if (!operationModal.is(':visible')) {
    showUserList();
    const id = getLocalStorage(CUR_SELECTED_USER);
    if (id) {
      $(`#${id}`).click();
    }
    operationModal.hide();
    showSelectModal();
    circleIcon.addClass('active');
    filter.focus();
  }
}


function handleClickCircle() {
  if (circleMoved) {
    selectModal.hide();
    circleIcon.removeClass('active');
  } else {
    toggleModal();
    showContextMenu();
  }
}

function handleResize() {
  circle.css('left', '5%');
  circle.css('bottom', '10%');
  circle.css('right', 'unset');
  circle.css('top', 'unset');
  const height = $(window).height() * 0.6;
  envUl.css('max-height', height);
  userUl.css('max-height', height);
  filterUl.css('max-height', height);
}

let filterTimer = null;
const filterDelay = 600;
function handleFilterChange() {
  clearTimeout(filterTimer);
  filterTimer = setTimeout(() => {
    const filterWord = filter.val().trim().toLowerCase();
    if (filterWord) {
      topBtn.addClass('w-nohost-disabled');
      filterUl.show();
      userUl.hide();
      envUl.hide();
      filterEnvs(filterWord);
    } else if (selectedUser) {
      topBtn.removeClass('w-nohost-disabled');
      filterUl.hide();
      userUl.hide();
      envUl.show();
    } else {
      topBtn.removeClass('w-nohost-disabled');
      filterUl.hide();
      userUl.show();
      envUl.hide();
    }
  }, filterDelay);
}

function toggleCustomContextModal() {
  customModal.show();
  setTop('#w-nohost-custom-menu');
}

function initCustomContext() {
  if (
    window.nohostContextMenuExtensions
    && Array.isArray(window.nohostContextMenuExtensions)
    && window.nohostContextMenuExtensions.length !== 0
  ) {
    customEntry.show();
    const container = document.createDocumentFragment();
    const modalContainer = document.createDocumentFragment();
    window.nohostContextMenuExtensions.map((item) => {
      const { name, title, onClick, autoHide = true } = item;
      const div = document.createElement('div');
      div.className = 'w-nohost-custom-item';
      div.innerHTML = name;
      div.title = title;
      div.onclick = (e) => {
        onClick({ ...e, hide: circleContext.hide });
        if (autoHide) {
          circleContext.hide();
        }
      };
      container.appendChild(div);
      const btn = document.createElement('button');
      btn.className = 'w-nohost-operation';
      btn.innerHTML = name;
      btn.onclick = (e) => {
        onClick({ ...e, hide: customModal.hide });
        if (autoHide) {
          customModal.hide();
        }
      };
      modalContainer.appendChild(btn);
    });
    customContext.html(container);
    $('#w-nohost-custom-menu').append(modalContainer);
  } else {
    customEntry.hide();
    customEntryBtn.addClass('w-nohost-custom-btn-hide');
  }
}

function injectHTML() {
  if ($('#w-nohost').length !== 0) {
    return;
  }
  const nohost = $(tpl);
  nohost.appendTo(document.body);

  selectModal = $('#w-nohost-select-modal');
  operationModal = $('#w-nohost-operation-modal');

  circle = $('#w-nohost-circle');
  circleIcon = $('#w-nohost-circle-icon');
  circleContext = $('#w-nohost-circle-context');
  circleEnv = $('#w-nohost-circle-env');
  filter = $('#w-nohost-filter');
  userUl = $('#w-nohost-user-ul');
  filterUl = $('#w-nohost-env-filter');
  envUl = $('#w-nohost-env-ul');
  topBtn = $('#w-nohost-btn--top');
  toast = $('#w-nohost-toast');
  circleLast = $('#w-nohost-circle-last');
  circleDefault = $('#w-nohost-circle-default');
  customEntry = $('#w-nohost-custom');
  customContext = $('#w-nohost-custom-context');
  customEntryBtn = $('#w-nohost-custom-btn');
  customModal = $('#w-nohost-custom-context-modal');

  $('.w-nohost-toast-close').click((event) => {
    if (timer) {
      return;
    }
    const $toast = $(event.target).parent('.w-nohost-toast');
    $toast.hide();
  });

  circle.mouseenter(showContextMenu).mouseleave(() => {
    circleContext.hide();
  });
  const seletedElem = (e, down) => {
    let curElem = filterUl.find('.envSelected');
    if (curElem.length) {
      curElem.removeClass('envSelected');
      curElem = $(curElem[0])[down ? 'next' : 'prev']('li');
    }
    if (!curElem.length) {
      curElem = filterUl.find(`li:${down ? 'first' : 'last'}`);
    }
    curElem.addClass('envSelected');
    scrollToView(curElem);
    e.preventDefault();
  };
  filter.on('keydown', (e) => {
    const { keyCode } = e;
    const down = keyCode === 40;
    if ((down || keyCode === 38) && filterUl.is(':visible')) {
      return seletedElem(e, down);
    }
  }).on('keyup', (e) => {
    if (e.keyCode === 13) {
      filterUl.find('.envSelected').trigger('click');
    } else if (e.keyCode === 27) {
      selectModal.hide();
    }
  });

  $('#w-nohost-circle-user').on('click', openCurrentUser);
  circleLast.on('click', () => {
    const lastEnv = getLocalStorage(LAST_SELECTED_ENV);
    const arr = lastEnv.split('/');
    sendSelect({ name: arr[0], envId: arr[1] });
  });
  circleDefault.on('click', () => {
    sendSelect({ name: '~' });
  });

  circleIcon.on('touchstart', handleTouchInMobile)
    .on('mousedown', circleWillMove)
    .on('click', handleClickCircle)
    .hover(() => {
      circleIcon.addClass('active');
    }, () => {
      if (!selectModal.is(':visible')) {
        circleIcon.removeClass('active');
      }
    });

  $('#w-nohost-circle-open').on('click', toggleModal);
  $(document)
    .on('touchmove', handleMoveInMobile)
    .on('touchend', handleMoveEndInMobile)
    .on('mousemove', handleMoveInPC)
    .on('mouseup', handleCircleMoved);

  $('#w-nohost-operations').on('click', '.w-nohost-operation', (e) => {
    const target = $(e.target);
    switch (target.attr('id')) {
      case 'w-nohost-reload-page':
        reloadPage();
        break;
      case 'w-nohost-clear-cookie':
        if (clearCookie()) {
          showSuccessToast(`清除${document.domain}域cookie成功`, TOAST_DURATION);
        } else {
          showErrorToast(`清除${document.domain}域cookie失败`, TOAST_DURATION);
        }
        break;
      case 'w-nohost-clear-storage':
        if (clearStorage()) {
          showSuccessToast('清除localStorage成功', TOAST_DURATION);
        } else {
          showErrorToast('清除localStorage失败', TOAST_DURATION);
        }
        break;
      case 'w-nohost-choose-env':
        operationModal.hide();
        toggleModal();
        break;
      case 'w-nohost-custom-btn':
        operationModal.hide();
        toggleCustomContextModal();
        break;
      default:
        break;
    }
  });
  filter.on('input', handleFilterChange);
  selectModal.on('click', handleClickModal);
  operationModal.on('click', handleClickModal);
  customModal.on('click', handleClickModal);
  $('#w-nohost-close-modal').on('click', () => {
    operationModal.hide();
  });
  $('#w-nohost-close-custom-modal').on('click', () => {
    customModal.hide();
  });
  userUl.on('click', handleChooseUser);
  envUl.on('click', handleChooseEnv);
  filterUl.on('click', handleChooseEnv);
  topBtn.on('click', (e) => {
    if (topBtn.hasClass('w-nohost-disabled')) {
      return;
    }
    if (selectedUser) {
      setLocalStorage(CUR_SELECTED_USER, '');
      selectedUser = null;
      filter.val('');
      showUserList(e);
    } else {
      scrollToView($('#w-nohost-user-ul .envSelected'), true);
    }
  });

  handleResize();
  $(window).resize(handleResize);

  genUserList();
  initCustomContext();
}

function init() {
  // 该脚本可能被加载多次，若已加载则不执行以下步骤
  if ($('#w-nohost').length === 0) {
    injectHTML();
    // 避免被清掉，周期性检查
    setInterval(injectHTML, 3000);
  }
  const copyError = () => showErrorToast('无法复制, 请重试或使用其它浏览器', TOAST_DURATION);
  const clipboard = new ClipboardJS('.w-nohost-copy-env');
  clipboard.on('success', (e) => {
    showSuccessToast('已复制当前环境到剪贴板', TOAST_DURATION);
    e.clearSelection();
  });
  clipboard.on('error', copyError);
  const clipboard2 = new ClipboardJS('.w-nohost-copy-link');
  clipboard2.on('success', (e) => {
    showSuccessToast('已复制包含当前环境的URL到剪贴板', TOAST_DURATION);
    e.clearSelection();
  });
  clipboard2.on('error', copyError);
}

// 在 iframe 中不执行操作
if (window.top === window.self) {
  getData();
  init();
  if (hideNohostBtn) {
    circle.hide();
  }
}
