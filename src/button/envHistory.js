/**
 * 记录页面环境切换历史
 * 目前最多记录5条
 */
import $ from 'jquery';
import { safeParse, getLocalStorage, setLocalStorage } from './helper';
import { LAST_SELECTED_ENV, ENV_HISTORY } from './const';

const NAME_RE = /^[\w.-]{1,24}$/;

function checkEnv(item) {
  if (!item || !item.name || !NAME_RE.test(item.name)) {
    return false;
  }
  item.envName = item.envName || '';
  item.envId = item.envId || '';
  return typeof item.envName === 'string' && typeof item.envId === 'string';
}

/**
 * 从缓存中获取切换记录
 */
export function getEnvHistory() {
  let localValue = getLocalStorage(LAST_SELECTED_ENV);

  if (!localValue) { return []; }

  if (localValue[0] !== '[') {
    // 保存了一个上次环境的早期情况, 这里直接清空
    try {
      localStorage.removeItem(LAST_SELECTED_ENV);
    } catch (e) {}

    return [];
  }
  localValue = safeParse(localValue) || [];
  return localValue.filter(checkEnv);
}

/**
 *  保存切换环境数据到localStorage，
 *  最后切换的环境保存到最前面
 */
export function setEnvHistory(newValue) {
  const envHistory = getEnvHistory();
  let index = -1;

  envHistory.some((item, idx) => {
    if (item.envId === newValue.envId) {
      index = idx;
      return true;
    }
  });

  if (index > -1) {
    envHistory.splice(index, 1);
  }

  // 保证上一个切换的排在第一个
  envHistory.unshift(newValue);

  if (envHistory.length > ENV_HISTORY) {
    envHistory.length = ENV_HISTORY;
  }

  setLocalStorage(LAST_SELECTED_ENV, JSON.stringify(envHistory));
}

/**
 *  初始化切换历史的二级选择框内容html。
 *  这里切换内容会随每次切换发生变化
 *  所以需要每次切换都重新渲染
 */
export function initEnvHistoryDom() {
  const envHistoryElement = $('#w-nohost-circle-history-list');

  const envHistory = getEnvHistory();
  if (envHistory.length < 1) { return; }

  const newList = document.createDocumentFragment();

  envHistory.forEach(({ name, envId, envName }) => {
    const div = document.createElement('div');

    div.className = 'w-nohost-second-item';
    div.innerText = `${name}/${envName}`;

    div.setAttribute('data-user-name', name);
    div.setAttribute('data-env-id', envId);
    div.setAttribute('data-env-name', envName);


    newList.appendChild(div);
  });

  envHistoryElement.html(newList);
}
