import AttrRecognizer from './attribute';
import { TOUCH_ACTION_NONE } from '../touchactionjs/touchaction-Consts';
import { STATE_BEGAN } from '../recognizerjs/recognizer-consts';

export type PinchRecognizerEvent = 'pinch' ;
export interface IHammerPinchRecognizerOptions {
  event: PinchRecognizerEvent ;
  threshold: number;
  pointers: number;
}


/**
 * @private
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
export default class PinchRecognizer extends AttrRecognizer {

  constructor(options: IHammerPinchRecognizerOptions) {
    super(Object.assign({
      event: 'pinch',
      threshold: 0,
      pointers: 2
    }, options));
  }

  getTouchAction() {
    return [TOUCH_ACTION_NONE];
  }

  attrTest(input: any) {
    // tslint:disable no-bitwise
    return super.attrTest(input) &&
        (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN) as any;
  }

  emit(input: any) {
    if (input.scale !== 1) {
      let inOut = input.scale < 1 ? 'in' : 'out';
      input.additionalEvent = this.options.event + inOut;
    }
    super.emit(input);
  }
}
