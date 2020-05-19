/**
 * @private
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
export default function inStr(str: any, find: any) {
  return str.indexOf(find) > -1;
}
