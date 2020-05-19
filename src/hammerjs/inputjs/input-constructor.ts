import boolOrFn from '../utils/bool-or-fn';
import addEventListeners from '../utils/add-event-listeners';
import removeEventListeners from '../utils/remove-event-listeners';
import getWindowForElement from '../utils/get-window-for-element';
import Manager from '../manager';

/**
 * @private
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
export default class Input {
  protected manager: Manager;
  protected callback: Function;
  protected element: HTMLElement;
  public target: any;
  protected evEl: any;
  protected evTarget: any;
  protected evWin: any;
  protected pressed: any;
  protected started: any;
  constructor(manager: Manager, callback: Function) {
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // this.init();

  }
  // smaller wrapper around the handler, for the scope and the enabled state of the manager,
  // so when disabled the input events are completely bypassed.
  private domHandler(ev: any) {
    if (boolOrFn(this.manager.options.enable, [this.manager])) {
      this.handler(ev);
    }
  }
  /**
   * @private
   * should handle the inputEvent data and trigger the callback
   * @virtual
   */
  protected handler(...args: any) {
    console.log(args);
  }

  /**
   * @private
   * bind the events
   */
  public init() {
    let fn = this.domHandler.bind(this);
    if (this.evEl) {
      addEventListeners(this.element, this.evEl, fn);
    }
    if (this.evTarget) {
      addEventListeners(this.target, this.evTarget, fn);
    }
    if (this.evTarget) {
      addEventListeners(this.target, this.evTarget, fn);
    }
    if (this.evWin) {
      addEventListeners(getWindowForElement(this.element), this.evWin, fn);
    }
  }

  /**
   * @private
   * unbind the events
   */
  public destroy() {
    if (this.evEl) {
      removeEventListeners(this.element, this.evEl, this.domHandler);
    }
    if (this.evTarget) {
      removeEventListeners(this.target, this.evTarget, this.domHandler);
    }
    if (this.evWin) {
      removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
  }
}
