import * as ng from 'angular';
import AttrRecognizer from './attribute';
import { TOUCH_ACTION_NONE } from '../touchactionjs/touchaction-Consts';
import { STATE_BEGAN } from '../recognizerjs/recognizer-consts';

export type RotateRecognizerEvent = 'rotate';
export interface IHammerRotateRecognizerOptions {
  event: RotateRecognizerEvent ;
  threshold: number;
  pointers: number;
}
/**
 * @private
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
export default class RotateRecognizer extends AttrRecognizer {

  constructor(options: IHammerRotateRecognizerOptions ) {
    super(Object.assign({event: 'rotate',
      threshold: 0,
      pointers: 2
    } as IHammerRotateRecognizerOptions, options));
  }

  getTouchAction() {
    return [TOUCH_ACTION_NONE];
  }

  attrTest(input: any) {
    // tslint:disable no-bitwise
    return super.attrTest(input) &&
        (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN) as any;
  }
}

