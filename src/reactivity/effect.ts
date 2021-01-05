import { Effect, EffectOptions } from '../typings/effect';

function effect(fn: Effect, options: EffectOptions = {}) {
  let effect = createReactiveEffect(fn);
  if (!options.lazy) {
    effect();
  }
}

let effectStack: Array<Effect> = [];
let activeEffect: Effect | null = null;

function createReactiveEffect(fn: Effect): Effect {
  const effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {
      // 执行之前把 effect 记录起来，和数据做关联，类似 vue2 的 Watcher 和 Dep
      activeEffect = effect;
      effectStack.push(effect);
      try {
        fn();
      } finally {
        // 结束之后把当前的活跃的 activeEffect 置为上一个，因为会有多层数据获取 state.company.address
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  }
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
    depsMap.set(key, (dep = new Set()))
  }
  dep.add(activeEffect);
}

function trigger(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    return ;
  }
  let dep = depsMap.get(key);
  if (!dep) {
    return ;
  }
  dep.forEach(effect => {
    effect && effect();
  });
}

export {
  effect,
  effectStack,
  activeEffect,
  track,
  trigger
}