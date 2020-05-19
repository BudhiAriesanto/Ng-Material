/**
 * @private
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
export default function getVelocity(deltaTime: number, x: number, y: number): any {
  return {
    x: x / deltaTime || 0,
    y: y / deltaTime || 0
  };
}
