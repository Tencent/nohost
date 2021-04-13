import $ from 'jquery';
import '../base.less';
import './index.css';

let curEnv;
let userList;
let newData;
// let rawData;
const USER_ICON = '<i aria-label="Account" class="anticon anticon-user"><svg viewBox="64 64 896 896" focusable="false" class="" data-icon="user" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M858.5 763.6a374 374 0 0 0-80.6-119.5 375.63 375.63 0 0 0-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 0 0-80.6 119.5A371.7 371.7 0 0 0 136 901.8a8 8 0 0 0 8 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 0 0 8-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"></path></svg></i>';
const LINK_ICON = '<i aria-label="Env" class="anticon anticon-link"><svg viewBox="64 64 896 896" focusable="false" class="" data-icon="link" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M574 665.4a8.03 8.03 0 0 0-11.3 0L446.5 781.6c-53.8 53.8-144.6 59.5-204 0-59.5-59.5-53.8-150.2 0-204l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3l-39.8-39.8a8.03 8.03 0 0 0-11.3 0L191.4 526.5c-84.6 84.6-84.6 221.5 0 306s221.5 84.6 306 0l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3L574 665.4zm258.6-474c-84.6-84.6-221.5-84.6-306 0L410.3 307.6a8.03 8.03 0 0 0 0 11.3l39.7 39.7c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c53.8-53.8 144.6-59.5 204 0 59.5 59.5 53.8 150.2 0 204L665.3 562.6a8.03 8.03 0 0 0 0 11.3l39.8 39.8c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c84.5-84.6 84.5-221.5 0-306.1zM610.1 372.3a8.03 8.03 0 0 0-11.3 0L372.3 598.7a8.03 8.03 0 0 0 0 11.3l39.6 39.6c3.1 3.1 8.2 3.1 11.3 0l226.4-226.4c3.1-3.1 3.1-8.2 0-11.3l-39.5-39.6z"></path></svg></i>';
const title = $('#w-nohost-title');
const filter = $('#w-nohost-filter');
const filterUl = $('#w-nohost-env-filter');
const userUl = $('#w-nohost-user-ul');
const envUl = $('#w-nohost-env-ul');
const backBtn = $('#w-nohost-btn--back').css('display', undefined);
const loader = $('#w-nohost-loader');
const successToast = $('#w-nohost-success-toast');
let inited = false; // 是否已初始化
let chosenUser = null;
const CUR_SELECTED_USER = '__nohost_-_selected_user_id__';
const TEMP_ELEM = $(document.createElement('div'));
const escape = (str) => {
  return TEMP_ELEM.text(str).html();
};
let shownCurEnvName;

const win = $(window);
function scrollToView(elem) {
  if (!elem[0]) {
    return;
  }
  const headHeight = filter.offset().top + 40;
  const top = elem.offset().top - headHeight;
  if (top < 5) {
    win.scrollTop(Math.max(win.scrollTop() + top, 0));
  } else {
    const height = win.height();
    if (top + 35 + 85 > height) {
      win.scrollTop(win.scrollTop() + top + 85 - height + 46);
    }
  }
}

function getEnvData(data) {
  const { list } = data;
  const uList = [{ name: '正式环境' }];
  // rawData = data;
  list.forEach((user) => {
    if (user.active) {
      const envList = user.envList.map((env) => {
        return Object.assign({}, env);
      });
      envList.unshift({ id: '', name: '正式环境' });
      uList.push({
        name: user.name,
        envList,
      });
    }
  });

  return { curEnv: data.curEnv, userList: uList };
}

function loadData(cb) {
  $.ajax({
    url: 'cgi-bin/list',
    type: 'json',
    method: 'get',
    cache: false,
    error: () => {
      if (!inited) {
        setTimeout(loadData, 1000);
      }
    },
    success: cb,
  });
}

function clearSelectMessage() {
  successToast[0].innerText = '';
  successToast.css('display', 'none');
}

function showSelectMessage(message) {
  loader.css('display', 'none');
  successToast[0].innerHTML = message;
  successToast.css('display', 'block');
  setTimeout(clearSelectMessage, 1600);
}

function getData() {
  const handleData = (data) => {
    newData = getEnvData(data);
    inited = true;
  };
  try {
    const { getNohostEnvData } = window.parent;
    if (typeof getNohostEnvData === 'function') {
      return getNohostEnvData(handleData);
    }
  } catch (e) {}
  loadData(handleData);
}

function showCurEnvName(envName) {
  if (!shownCurEnvName) {
    shownCurEnvName = true;
    showSelectMessage(envName);
  }
}

function genUserList() {
  if (newData) {
    curEnv = newData.curEnv;
    userList = newData.userList;
    newData = null;
  }
  if (!inited) {
    if (!userList) {
      return setTimeout(genUserList, 500);
    }
  }
  const newList = document.createDocumentFragment();
  userList.forEach((user, index) => {
    const li = document.createElement('li');
    li.setAttribute('data-index', index.toString());
    li.id = `__nohost_-_${user.name}`;
    const url = index ? `data.html?name=${user.name}` : 'admin.html';
    const tips = index ? `打开${user.name}的环境配置页面` : '打开系统管理员页面';
    const userLink = `<a title="${tips}" class="w-nohost-data-url" href="${url}" target="_blank">${USER_ICON}</a>`;
    const name = curEnv && curEnv.name;
    const envName = curEnv && curEnv.envName;
    const captureUrl = `data.html${name ? `?name=${name}${envName ? `&env=${envName}` : ''}` : ''}`;
    const capture = `<a title="打开抓包页面" class="w-nohost-data-url" href="${captureUrl}" target="_blank">${LINK_ICON}</a>`;
    li.innerHTML = `${userLink}${escape(user.name)}`;
    // 高亮已被选择的环境
    // 正式环境
    let curEnvName = '当前环境：正式环境';
    if (index === 0 && !name) {
      $(li).addClass('envSelected');
      title.html(`${curEnvName}${capture}`);
      showCurEnvName(curEnvName);
    } else if (curEnv && name === user.name) {
      $(li).addClass('envSelected');
      const html = escape(`${user.name} / ${envName || '正式环境'}`);
      li.innerHTML = `${userLink}${html}`;
      curEnvName = escape(`当前环境：${user.name} / ${envName || '正式环境'}`);
      title.html(`${curEnvName}${capture}`);
      backBtn.attr('title', curEnvName);
      showCurEnvName(curEnvName);
    }
    if (index !== 0) {
      $(li).addClass('liWithSub');
    }

    newList.appendChild(li);
  });
  userUl[0].innerHTML = '';
  userUl[0].appendChild(newList);
  filter.show();
  const id = localStorage[CUR_SELECTED_USER];
  if (id) {
    $(`#${id}`).click();
  }
}

function checkKeyword(str, keyword) {
  for (let i = 0, len = keyword.length; i < len; i++) {
    if (str.indexOf(keyword[i]) === -1) {
      return false;
    }
  }
  return true;
}
function filterEnvs(filterWord) {
  const newList = document.createDocumentFragment();
  filterWord = filterWord && filterWord.split(/\s+/);
  userList.forEach((user) => {
    if (!user.envList) {
      const userLink = `<a title="打开系统管理员页面" class="w-nohost-data-url"
        href="admin.html" target="_blank">${USER_ICON}</a>`;
      const li = document.createElement('li');
      li.id = `__nohost_-_${user.name}`;
      li.innerHTML = `${userLink}正式环境`;
      // 高亮已被选择的环境
      if (curEnv === '~' || !curEnv) {
        $(li).addClass('envSelected');
      }
      newList.appendChild(li);
      return;
    }
    user.envList.forEach((env) => {
      if (filterWord && !checkKeyword(`${user.name}/${env.name}`.toLowerCase(), filterWord)) {
        return;
      }
      const li = document.createElement('li');
      const url = `data.html?name=${encodeURIComponent(user.name)}&env=${env.name}`;
      const capture = `<a title="打开抓包页面" class="w-nohost-data-url" href="${url}" target="_blank">${LINK_ICON}</a>`;
      li.innerHTML = capture + escape(`${user.name} / ${env.name}`);
      li.setAttribute('data-user-name', user.name);
      li.setAttribute('data-env-name', env.name);
      li.setAttribute('data-env-id', env.id);
      // 高亮选择的块
      if (curEnv && user.name === curEnv.name) {
        // 选择的是正式环境
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
  filterUl[0].innerHTML = '';
  filterUl[0].appendChild(newList);
}

function showUserList() {
  filter.hide();
  title.show();
  backBtn.hide();
  genUserList();
  userUl.show();
  envUl.hide();
  return false;
}

function genEnvList(user) {
  const newList = document.createDocumentFragment();
  user.envList.forEach((env) => {
    const li = document.createElement('li');
    let envName = env.name === '正式环境' ? '' : encodeURIComponent(env.name);
    if (envName) {
      envName = `&env=${envName}`;
    }
    const url = `data.html?name=${encodeURIComponent(user.name)}${envName}`;
    const tips = '打开抓包页面';
    const capture = `<a title="${tips}" class="w-nohost-data-url" href="${url}" target="_blank">${LINK_ICON}</a>`;
    li.innerHTML = `${capture}${escape(env.name)}`;
    li.setAttribute('data-user-name', user.name);
    li.setAttribute('data-env-name', env.name);
    li.setAttribute('data-env-id', env.id);
    // 高亮选择的块
    if (curEnv && user.name === curEnv.name) {
      // 选择的是正式环境
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
  envUl[0].innerHTML = '';
  envUl[0].appendChild(newList);
}

function showEnvList(user) {
  title.hide();
  backBtn.show();
  genEnvList(user);
  userUl.hide();
  envUl.show();
}


function sendSelect(data) {
  showSelectMessage('正在切换环境 ...');
  $.ajax({
    url: 'cgi-bin/select',
    data: {
      name: data.name,
      envId: data.envId,
      time: Date.now(),
    },
    timeout: 2000,
    error() {
      showSelectMessage('环境切换失败');
    },
    success(res) {
      if (res.ec === 0) {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        showSelectMessage('环境切换失败');
      }
    },
  });
}

function handleChooseUser(event) {
  if (event.target.tagName !== 'LI') {
    return;
  }
  const index = event.target.getAttribute('data-index');
  if (index === '0') {
    sendSelect({
      name: '~',
    });
  } else {
    chosenUser = userList[index];
    showEnvList(chosenUser);
    const { name } = chosenUser;
    const tips = index ? `打开${name}的环境配置页面` : '打开系统管理员页面';
    const url = `data.html?name=${name}`;
    const userLink = `<a title="${tips}" class="w-nohost-data-url" href="${url}" target="_blank">${USER_ICON}</a>`;
    backBtn.html(`${userLink}返回账号列表 / ${escape(name)}`);
    localStorage[CUR_SELECTED_USER] = `__nohost_-_${name}`;
  }
  return false;
}

function handleChooseEnv(e) {
  if (e.target.tagName !== 'LI') {
    return;
  }
  const { target } = e;
  const name = target.getAttribute('data-user-name');
  const envId = target.getAttribute('data-env-id');
  const envName = target.getAttribute('data-env-name');
  sendSelect({
    name,
    envId,
    envName,
  });
  return false;
}

userUl.on('click', handleChooseUser);
envUl.on('click', handleChooseEnv);
filterUl.on('click', handleChooseEnv);

backBtn.on('click', (e) => {
  if (backBtn.hasClass('w-nohost-disabled') || $(e.target).closest('A').length) {
    return;
  }
  localStorage[CUR_SELECTED_USER] = '';
  showUserList(e);
});

let filterTimer = null;
const filterDelay = 300;
filter
  .on('input', () => {
    clearTimeout(filterTimer);
    filterTimer = setTimeout(() => {
      const filterWord = filter.val().trim().toLowerCase();
      if (filterWord) {
        backBtn.addClass('w-nohost-disabled');
        filterUl.show();
        userUl.hide();
        envUl.hide();
        filterEnvs(filterWord);
      } else if (chosenUser) {
        backBtn.removeClass('w-nohost-disabled');
        filterUl.hide();
        userUl.hide();
        envUl.show();
      } else {
        backBtn.removeClass('w-nohost-disabled');
        filterUl.hide();
        userUl.show();
        envUl.hide();
      }
    }, filterDelay);
  })
  .on('keydown', (event) => {
    const $first = $('#w-nohost-list ul:visible li:first-child');
    const $last = $('#w-nohost-list ul:visible li:last-child');
    const $choosed = $('#w-nohost-list ul:visible li.choosed');
    switch (event.which) {
      case 38: // up
        if ($choosed.length > 0 && $choosed.prev().length > 0) {
          $choosed.removeClass('choosed');
          $choosed.prev().addClass('choosed');
        } else if ($last.length > 0) {
          $choosed.removeClass('choosed');
          $last.addClass('choosed');
        }
        scrollToView($('#w-nohost-list ul:visible li.choosed'));
        break;
      case 40: // down
        if ($choosed.length > 0 && $choosed.next().length > 0) {
          $choosed.removeClass('choosed');
          $choosed.next().addClass('choosed');
        } else if ($first.length > 0) {
          $choosed.removeClass('choosed');
          $first.addClass('choosed');
        }
        scrollToView($('#w-nohost-list ul:visible li.choosed'));
        break;
      case 13: // enter
        $choosed.click();
        break;
      case 37: // left
      case 27: // esc
        backBtn.click();
        break;
      default:
        return; // exit this handler for other keys
    }
    event.preventDefault(); // prevent the default action (scroll / move caret)
  });

getData();
showUserList();
