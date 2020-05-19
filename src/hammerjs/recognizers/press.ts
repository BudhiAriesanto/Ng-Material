import * as ng from 'angular';
import Recognizer from '../recognizerjs/recognizer-constructor';
import {
    STATE_RECOGNIZED,
    STATE_FAILED
} from '../recognizerjs/recognizer-consts';
import { now } from '../utils/utils-consts';
import setTimeoutContext from '../utils/set-timeout-context';
import { TOUCH_ACTION_AUTO } from '../touchactionjs/touchaction-Consts';
import {
    INPUT_START,
    INPUT_END,
    INPUT_CANCEL
} from '../inputjs/input-consts';

export type PressRecognizerEvent = 'press';
export interface IHammerPressRecognizerOptions {
  event: PressRecognizerEvent ;
  threshold: number;
  pointers: number;
  time: number;
}

/**
 * @private
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
export default class PressRecognizer extends Recognizer {
  private _timer: any = null;
  private _input: any = null;
  constructor(options: IHammerPressRecognizerOptions) {
    super(Object.assign({
      event: 'press',
      pointers: 1,
      time: 251, // minimal time of the pointer to be pressed
      threshold: 9 // a minimal movement is ok, but keep it low
    }, options));
  }

  getTouchAction() {
    return [TOUCH_ACTION_AUTO];
  }

  process(input: any) {
    let { options } = this;
    let validPointers = input.pointers.length === options.pointers;
    let validMovement = input.distance < options.threshold;
    let validTime = input.deltaTime > options.time;

    this._input = input;

    // we only allow little movement
    // and we've reached an end event, so a tap is possible
    // tslint:disable no-bitwise
    if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
      this.reset();
    } else if (input.eventType & INPUT_START) {
      this.reset();
      this._timer = setTimeoutContext(() => {
        this.state = STATE_RECOGNIZED;
        this.tryEmit();
      }, options.time, this);
    } else if (input.eventType & INPUT_END) {
      return STATE_RECOGNIZED;
    }
    return STATE_FAILED;
  }

  reset() {
    clearTimeout(this._timer);
  }

  emit(input: any) {
    if (this.state !== STATE_RECOGNIZED) {
      return;
    }

    if (input && (input.eventType & INPUT_END)) {
      this.manager.emit(`${this.options.event}up`, input);
    } else {
      this._input.timeStamp = now();
      this.manager.emit(this.options.event, this._input);
    }
  }
}
