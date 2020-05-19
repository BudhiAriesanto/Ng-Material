/**
 * @private
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
export default function bindFn(fn: Function, context: any) {
  return function boundFn() {
    return fn.apply(context, arguments);
  };
}
