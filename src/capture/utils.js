export const setLocalStorage = (key, value) => {
  try {
    localStorage[key] = value;
  } catch (e) {}
};

export const getLocalStorage = key => {
  try {
    return localStorage[key];
  } catch (e) {}
};

export function safeParse(param) {
  try {
    return JSON.parse(param);
  } catch (e) {
    return null;
  }
}
