/**
 * 删除当前域名的所有cookie
 * 带有HttpOnly的cookie无法删除
 * 带有Path的cookie无法删除
 */
function removeCookie(name, domain) {
  const expiredCookie = `${name}=;max-age=-1;expires=Thu, 01 Jan 1970 00:00:00 GMT;${domain || ''}`;
  document.cookie = expiredCookie;
  document.cookie = `${expiredCookie};path=/`;
}

export function clearCookie() {
  const cookies = document.cookie.split(';');

  cookies.forEach((cookie) => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    if (name !== 'whistle_nohost_env') {
      removeCookie(name);
      const list = window.location.hostname.split('.');
      for (let i = 0, len = list.length - 1; i < len; i++) {
        let domain = list.slice(i);
        domain.unshift('domain=');
        domain = domain.join('.');
        removeCookie(name, domain);
      }
    }
  });
  return true;
}

export function clearStorage() {
  if (localStorage.clear) {
    localStorage.clear();
    return true;
  }
  return false;
}

export function reloadPage() {
  window.location.reload(true);
}

export function checkKeyword(str, keyword) {
  if (!keyword) {
    return false;
  }
  str = str.toLowerCase();
  for (let i = 0, len = keyword.length; i < len; i++) {
    if (str.indexOf(keyword[i]) === -1) {
      return false;
    }
  }
  return true;
}

export function scrollToView(elem, center) {
  if (!elem[0]) {
    return;
  }
  const pElem = elem.parent();
  const top = elem.offset().top - pElem.offset().top;
  if (top < 5) {
    pElem.scrollTop(pElem.scrollTop() + top - (center ? pElem.height() / 2 - 20 : 0));
  } else {
    const height = pElem[0].offsetHeight;
    if (top + 35 > height) {
      pElem.scrollTop(pElem.scrollTop() + (top - height + 46) + (center ? pElem.height() / 2 - 20 : 0));
    }
  }
}

export function getLocalStorage(key) {
  try {
    return localStorage[key];
  } catch (e) {}
}

export function setLocalStorage(key, value) {
  try {
    localStorage[key] = value;
  } catch (e) {}
}

export function safeParse(param) {
  try {
    return JSON.parse(param);
  } catch (e) {
    return null;
  }
}
