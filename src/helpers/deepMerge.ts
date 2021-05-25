import { Merge } from 'ts-essentials';

export const deepMerge = <T extends Record<string, any>, T2 extends Record<string, any>>(target: T, toMerge: T2) => {
  const targetClone = JSON.parse(JSON.stringify(target));

  for (const key in toMerge) {
    if (typeof targetClone[key] === 'object') {
      deepMerge(targetClone[key], toMerge[key]);
    } else {
      targetClone[key] = toMerge[key];
    }
  }

  return targetClone as Merge<T, T2>;
}