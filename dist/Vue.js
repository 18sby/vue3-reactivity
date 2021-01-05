(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VueReactivity = {}));
}(this, (function (exports) { 'use strict';

  function effect(fn, options = {}) {
      let effect = createReactiveEffect(fn);
      if (!options.lazy) {
          effect();
      }
  }
  let effectStack = [];
  exports.activeEffect = null;
  function createReactiveEffect(fn) {
      const effect = function reactiveEffect() {
          if (!effectStack.includes(effect)) {
              // 执行之前把 effect 记录起来，和数据做关联，类似 vue2 的 Watcher 和 Dep
              exports.activeEffect = effect;
              effectStack.push(effect);
              try {
                  fn();
              }
              finally {
                  // 结束之后把当前的活跃的 activeEffect 置为上一个，因为会有多层数据获取 state.company.address
                  effectStack.pop();
                  exports.activeEffect = effectStack[effectStack.length - 1];
              }
          }
      };
      return effect;
  }
  const targetMap = new WeakMap();
  // state.company
  // { state: { company: Set<Effect>[] } }
  function track(target, key) {
      let depsMap = targetMap.get(target);
      if (!depsMap) {
          targetMap.set(target, (depsMap = new Map()));
      }
      let dep = depsMap.get(key);
      if (!dep) {
          depsMap.set(key, (dep = new Set()));
      }
      dep.add(exports.activeEffect);
  }
  function trigger(target, key) {
      let depsMap = targetMap.get(target);
      if (!depsMap) {
          return;
      }
      let dep = depsMap.get(key);
      if (!dep) {
          return;
      }
      dep.forEach(effect => {
          effect && effect();
      });
  }

  const isObject = value => {
      return Object.prototype.toString.call(value) === '[object Object]';
  };
  const isArray = value => {
      return Array.isArray(value);
  };
  const hasOwnKey = (target, key) => {
      return target.hasOwnProperty(key);
  };
  const hasChange = (oldValue, newValue) => {
      return oldValue === newValue;
  };

  const mutableHandler = {
      get(target, key, receiver) {
          // 取值的时候，把取出的值也代理起来，懒代理，效率高
          let res = Reflect.get(target, key, receiver);
          track(target, key);
          return isObject(res) ? reactive(res) : res;
      },
      set(target, key, value, receiver) {
          const oldValue = target[key];
          // 区分数组和对象是增加属性还是修改属性
          let result = Reflect.set(target, key, value, receiver);
          const hadKey = (isArray(target) && (parseInt(key) + '' === key)) ? (Number(key) < target.length) : hasOwnKey(target, key);
          if (hadKey) {
              console.log('修改属性', key);
          }
          else if (hasChange(oldValue, result)) {
              console.log('增加属性', key);
          }
          trigger(target, key);
          return result;
      }
  };

  const reactiveMap = new WeakMap(); // 去重，不要重复代理
  function reactive(target) {
      return createReactiveObject(target);
  }
  function createReactiveObject(target, baseHandler) {
      if (!isObject(target)) {
          return;
      }
      let existProxy = reactiveMap.get(target);
      if (existProxy) {
          return existProxy;
      }
      let proxy = new Proxy(target, mutableHandler);
      reactiveMap.set(target, proxy);
      return proxy;
  }

  exports.effect = effect;
  exports.effectStack = effectStack;
  exports.reactive = reactive;
  exports.track = track;
  exports.trigger = trigger;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
