import AttrRecognizer from '../recognizers/attribute';
import { abs } from '../utils/utils-consts';
import { DIRECTION_HORIZONTAL, DIRECTION_VERTICAL } from '../inputjs/input-consts';
import PanRecognizer from './pan';
import { INPUT_END } from '../inputjs/input-consts';
import directionStr from '../recognizerjs/direction-str';


export type SwipeRecognizerEvent = 'swipe';
export interface IHammerSwipeRecognizerOptions {
  event?: SwipeRecognizerEvent ;
  threshold?: number;
  pointers?: number;
  velocity?: number;
  direction?: number;
}
/**
 * @private
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
export default class SwipeRecognizer extends AttrRecognizer {
  // tslint:disable no-bitwise
  constructor(options: IHammerSwipeRecognizerOptions) {
    super(Object.assign({
      event: 'swipe',
      threshold: 10,
      velocity: 0.3,
      direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
      pointers: 1
    } as IHammerSwipeRecognizerOptions, options));
  }

  getTouchAction() {
    return PanRecognizer.prototype.getTouchAction.call(this);
  }

  attrTest(input: any) {
    let { direction } = this.options;
    let velocity;

    if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
      velocity = input.overallVelocity;
    } else if (direction & DIRECTION_HORIZONTAL) {
      velocity = input.overallVelocityX;
    } else if (direction & DIRECTION_VERTICAL) {
      velocity = input.overallVelocityY;
    }

    return (super.attrTest(input) &&
        direction & input.offsetDirection &&
        input.distance > this.options.threshold &&
        input.maxPointers === this.options.pointers &&
        abs(velocity) > this.options.velocity && input.eventType & INPUT_END) as any ;
  }

  emit(input: any) {
    let direction = directionStr(input.offsetDirection);
    if (direction) {
      this.manager.emit(this.options.event + direction, input);
    }

    this.manager.emit(this.options.event, input);
  }
}
