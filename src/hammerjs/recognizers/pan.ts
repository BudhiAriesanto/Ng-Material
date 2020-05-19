import  AttrRecognizer from './attribute';
import {
    DIRECTION_ALL,
    DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL,
    DIRECTION_NONE,
    DIRECTION_UP,
    DIRECTION_DOWN,
    DIRECTION_LEFT,
    DIRECTION_RIGHT
} from '../inputjs/input-consts';
import { STATE_BEGAN } from '../recognizerjs/recognizer-consts';
import { TOUCH_ACTION_PAN_X, TOUCH_ACTION_PAN_Y } from '../touchactionjs/touchaction-Consts';
import directionStr from '../recognizerjs/direction-str';


export type PanRecognizerEvent = 'pan' ;
export interface IHammerPanRecognizerOptions {
  event: PanRecognizerEvent ;
  threshold: number;
  pointers: number;
  direction: number;
}


/**
 * @private
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
export default class PanRecognizer extends AttrRecognizer {
  private pX: number = null;
  private pY: number = null;
  constructor(options: IHammerPanRecognizerOptions) {
    super(Object.assign({
      event: 'pan',
      threshold: 10,
      pointers: 1,
      direction: DIRECTION_ALL
    }, options));
  }

  getTouchAction() {
    let { options: { direction } } = this;
    let actions = [];
    // tslint:disable no-bitwise
    if (direction & DIRECTION_HORIZONTAL) {
      actions.push(TOUCH_ACTION_PAN_Y);
    }
    if (direction & DIRECTION_VERTICAL) {
      actions.push(TOUCH_ACTION_PAN_X);
    }
    return actions;
  }

  directionTest(input: any) {
    let { options } = this;
    let hasMoved = true;
    let { distance } = input;
    let { direction } = input;
    let x = input.deltaX;
    let y = input.deltaY;

    // lock to axis?
    if (!(direction & options.direction)) {
      if (options.direction & DIRECTION_HORIZONTAL) {
        direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
        hasMoved = x !== this.pX;
        distance = Math.abs(input.deltaX);
      } else {
        direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
        hasMoved = y !== this.pY;
        distance = Math.abs(input.deltaY);
      }
    }
    input.direction = direction;
    return hasMoved && distance > options.threshold && direction & options.direction;
  }

  attrTest(input: any) {
    // AttrRecognizer.prototype.attrTest.call(this, input)
    return super.attrTest(input) && // replace with a super call
        (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input))) as any;
  }

  emit(input: any) {

    this.pX = input.deltaX;
    this.pY = input.deltaY;

    let direction = directionStr(input.direction);

    if (direction) {
      input.additionalEvent = this.options.event + direction;
    }
    super.emit(input);
  }
}
