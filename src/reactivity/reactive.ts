import { State } from '../typings/reactive';
import { mutableHandler } from './baseHandler';
import { isObject } from '../shared/index';

const reactiveMap = new WeakMap(); // 去重，不要重复代理

function reactive(target: State) {
  return createReactiveObject(target, mutableHandler);
}

function createReactiveObject(target: State, baseHandler) {
  if (!isObject(target)) {
    return ;
  }
  let existProxy = reactiveMap.get(target);
  if (existProxy) {
    return existProxy;
  }
  let proxy = new Proxy(target, mutableHandler);
  reactiveMap.set(target, proxy);
  return proxy;
}

export {
  reactive
}