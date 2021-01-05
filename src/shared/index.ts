const isObject = value => {
  return Object.prototype.toString.call(value) === '[object Object]';
}

const isArray = value => {
  return Array.isArray(value);
}

const hasOwnKey = (target, key) => {
  return target.hasOwnProperty(key);
}

const hasChange = (oldValue, newValue) => {
  return oldValue === newValue;
}

export {
  isObject,
  isArray,
  hasOwnKey,
  hasChange
}