import * as ng from 'angular';
import splitStr from './split-str';
/**
 * @private
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
export default function addEventListeners(target: HTMLElement, types: any, handler: any) {
  ng.forEach(splitStr(types), (type: any) => {
    target.addEventListener(type, handler, false);
  });
}
