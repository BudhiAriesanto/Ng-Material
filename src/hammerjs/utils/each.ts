
/**
 * @private
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
export default function each(obj: any, iterator: any, context?: any) {
  let i;

  if (!obj) {
    return;
  }

  if (obj.forEach) {
    obj.forEach(iterator, context);
  } else if (obj.length !== undefined) {
    i = 0;
    while (i < obj.length) {
      iterator.call(context, obj[i], i, obj);
      i++;
    }
  } else {
    let keys: Array<string> = (obj.prototype ? Object.getOwnPropertyNames(obj.prototype) : Object.keys(obj));
    keys.filter((key: string, index: number) => {
      // if (obj.hasOwnProperty(key)) {
        iterator.call(context, obj[key], key, obj);
      // }
      return false;
    });
  }
}
