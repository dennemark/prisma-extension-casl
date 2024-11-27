/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: any) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function deepMerge(target: any, ...sources: any[]) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}