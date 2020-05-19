import {
    STATE_POSSIBLE,
    STATE_ENDED,
    STATE_FAILED,
    STATE_RECOGNIZED,
    STATE_CANCELLED,
    STATE_BEGAN,
    STATE_CHANGED
} from './recognizer-consts';
// import assign from '../utils/assign';
import uniqueId from '../utils/unique-id';
import ifUndefined from '../utils/if-undefined';
import invokeArrayArg from '../utils/invoke-array-arg';
import inArray from '../utils/in-array';
import boolOrFn from '../utils/bool-or-fn';
import getRecognizerByNameIfManager from './get-recognizer-by-name-if-manager';
import stateStr from './state-str';
import Manager from '../manager';
import Input from '../inputjs/input-constructor';

/**
 * @private
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */

export interface IRecognizerPlugin {
  process(inputData: Input): any;
  reset(): any;
  emit(inputData: Input): any;
  getTouchAction(): any;
}

/**
 * @private
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
export default class Recognizer {
  protected defaults: any = {};
  public id: any = uniqueId();
  public manager: Manager = null;
  public state: any = STATE_POSSIBLE;
  public simultaneous: any = {};
  public requireFail: Array<any> = [];
  constructor(public options: any) {
    this.options = Object.assign({}, this.defaults, options);
    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;
    this.simultaneous = {};
    this.requireFail = [];
  }

  /**
   * @private
   * set options
   * @param {Object} options
   * @return {Recognizer}
   */
  public set(options: any): any {
    Object.assign(this.options, options);

    // also update the touchAction, in case something changed about the directions/enabled state
    if (this.manager) {
      this.manager.touchAction.update();
    }
    return this;
  }

  /**
   * @private
   * recognize simultaneous with an other recognizer.
   * @param {Recognizer} otherRecognizer
   * @returns {Recognizer} this
   */
  public recognizeWith(otherRecognizer: any) {
    if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
      return this;
    }

    let { simultaneous } = this;
    otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
    if (!simultaneous[otherRecognizer.id]) {
      simultaneous[otherRecognizer.id] = otherRecognizer;
      otherRecognizer.recognizeWith(this);
    }
    return this;
  }

  /**
   * @private
   * drop the simultaneous link. it doesnt remove the link on the other recognizer.
   * @param {Recognizer} otherRecognizer
   * @returns {Recognizer} this
   */
  dropRecognizeWith(otherRecognizer: any) {
    if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
      return this;
    }

    otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
    delete this.simultaneous[otherRecognizer.id];
    return this;
  }

  /**
   * @private
   * recognizer can only run when an other is failing
   * @param {Recognizer} otherRecognizer
   * @returns {Recognizer} this
   */
  public requireFailure(otherRecognizer: any) {
    if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
      return this;
    }

    let { requireFail } = this;
    otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
    if (inArray(requireFail, otherRecognizer) === -1) {
      requireFail.push(otherRecognizer);
      otherRecognizer.requireFailure(this);
    }
    return this;
  }

  /**
   * @private
   * drop the requireFailure link. it does not remove the link on the other recognizer.
   * @param {Recognizer} otherRecognizer
   * @returns {Recognizer} this
   */
  dropRequireFailure(otherRecognizer: any) {
    if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
      return this;
    }

    otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
    let index = inArray(this.requireFail, otherRecognizer);
    if (index > -1) {
      this.requireFail.splice(index, 1);
    }
    return this;
  }

  /**
   * @private
   * has require failures boolean
   * @returns {boolean}
   */
  hasRequireFailures() {
    return this.requireFail.length > 0;
  }

  /**
   * @private
   * if the recognizer can recognize simultaneous with an other recognizer
   * @param {Recognizer} otherRecognizer
   * @returns {Boolean}
   */
  canRecognizeWith(otherRecognizer: any) {
    return !!this.simultaneous[otherRecognizer.id];
  }

  /**
   * @private
   * You should use `tryEmit` instead of `emit` directly to check
   * that all the needed recognizers has failed before emitting.
   * @param {Object} input
   */
  emit(input: any) {
    console.log('ada');
    let self = this;
    let { state } = this;

    function emit(event: any) {
      self.manager.emit(event, input);
    }

    // 'panstart' and 'panmove'
    if (state < STATE_ENDED) {
      emit(self.options.event + stateStr(state));
    }

    emit(self.options.event); // simple 'eventName' events

    if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
      emit(input.additionalEvent);
    }

    // panend and pancancel
    if (state >= STATE_ENDED) {
      emit(self.options.event + stateStr(state));
    }
  }

  /**
   * @private
   * Check that all the require failure recognizers has failed,
   * if true, it emits a gesture event,
   * otherwise, setup the state to FAILED.
   * @param {Object} input
   */
  tryEmit(input?: any) {
    if (this.canEmit()) {
      return this.emit(input);
    }
    // it's failing anyway
    this.state = STATE_FAILED;
  }

  /**
   * @private
   * can we emit?
   * @returns {boolean}
   */
  canEmit() {
    let i = 0;
    while (i < this.requireFail.length) {
      // tslint:disable no-bitwise
      if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
        return false;
      }
      i++;
    }
    return true;
  }

  /**
   * @private
   * update the recognizer
   * @param {Object} inputData
   */
  recognize(inputData: Input) {
    // make a new copy of the inputData
    // so we can change the inputData without messing up the other recognizers
    let inputDataClone = Object.assign({}, inputData);

    // is is enabled and allow recognizing?
    if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
      this.reset();
      this.state = STATE_FAILED;
      return;
    }

    // reset when we've reached the end
    if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
      this.state = STATE_POSSIBLE;
    }

    this.state = this.process(inputDataClone);

    // the recognizer has recognized a gesture
    // so trigger an event
    if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
      this.tryEmit(inputDataClone);
    }
  }

  /**
   * @private
   * return the state of the recognizer
   * the actual recognizing happens in this method
   * @virtual
   * @param {Object} inputData
   * @returns {constant} STATE
   */

  /* jshint ignore:start */
  process(inputData: Input) {
    //
  }
  /* jshint ignore:end */

  /**
   * @private
   * return the preferred touch-action
   * @virtual
   * @returns {Array}
   */
  getTouchAction() {
    //
  }


  /**
   * @private
   * called when the gesture isn't allowed to recognize
   * like when another is being recognized or it is disabled
   * @virtual
   */
  reset() {
    //
   }
}

