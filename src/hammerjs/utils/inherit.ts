// import assign from './assign';
/**
 * @private
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
export default function inherit(child: any, base: any, properties: any) {
  let baseP = base.prototype;
  let childP;

  childP = child.prototype = Object.create(baseP);
  childP.constructor = child;
  childP._super = baseP;

  if (properties) {
    Object.assign(childP, properties);
  }
}
