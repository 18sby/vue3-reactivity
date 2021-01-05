import { hasOwnKey, isArray, isObject, hasChange } from '../shared/index';
import { reactive } from './reactive';
import { track, trigger } from './effect';

const mutableHandler: ProxyHandler<Object> = {
  get(target: Object, key, receiver): any {
    // 取值的时候，把取出的值也代理起来，懒代理，效率高
    let res = Reflect.get(target, key, receiver)
    track(target, key);
    return isObject(res) ? reactive(res) : res;
  },
  set(target: Object, key: any, value, receiver): boolean {
    const oldValue = target[key];
    // 区分数组和对象是增加属性还是修改属性
    let result = Reflect.set(target, key, value, receiver);
    const hadKey = (isArray(target) && (parseInt(key) + '' === key)) ? (Number(key) < (target as any).length) : hasOwnKey(target, key);
    if (hadKey) {
      console.log( '修改属性', key );
    } else if (hasChange(oldValue, result)) {
      console.log( '增加属性', key );
    }
    trigger(target, key);
    return result;
  }
}

export {
  mutableHandler
}