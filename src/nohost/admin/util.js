
export function openHelp() {
  window.open('https://github.com/imweb/nohost');
}

export function openSelect() {
  window.open('select.html');
}

export const isPressEnter = (e) => {
  if (e.type !== 'keydown') {
    return true;
  }
  if ((e.keyCode === 13 || e.keyCode === 83) && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    return true;
  }
};
