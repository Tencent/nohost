import { setLocalStorage, getLocalStorage, safeParse } from '../../capture/utils';

export default class RulesHistory {
  constructor() {
    this.key = 'rulesHistory';
    this.maxLength = 5;
  }

  add(newValue) {
    const history = this.get();
    const index = history.indexOf(newValue);

    if (index > -1) {
      history.splice(index, 1);
    }

    history.unshift(newValue);

    if (history.length > this.maxLength) {
      history.length = this.maxLength;
    }

    setLocalStorage(this.key, JSON.stringify(history));
  }

  get() {
    const local = getLocalStorage(this.key);

    return safeParse(local) || [];
  }

  back() {
    const history = this.get();
    // 栈顶对应当前的环境
    const current = history.shift();
    const latest = history[0] || '';

    history.push(current);
    setLocalStorage(this.key, JSON.stringify(history));

    return latest;
  }
}
