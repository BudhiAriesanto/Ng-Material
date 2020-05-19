/**
 * @private
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */

export default function splitStr(str: string) {
  return str.trim().split(/\s+/g);
}
