import * as ng from 'angular';
import { IMDUtilServices } from './util';
import { NgService, method } from './decorator';

const HANDLERS = {};

/**
 * The state of the current 'pointer'. The pointer represents the state of the current touch.
 * It contains normalized x and y coordinates from DOM events,
 * as well as other information abstracted from the DOM.
 */
let pointer: any, lastPointer: any, maxClickDistance: number = 6;
let forceSkipClickHijack: boolean = false, disableAllGestures: boolean = false;

export class MdGestureServices {
  private hasJQuery: boolean;
  /* @ngInject */
  constructor($$MdGestureHandler: any, $$rAF: any, $timeout: ng.ITimeoutService, $mdUtil: IMDUtilServices) {
    const touchActionProperty = this.getTouchAction();
    // this.hasJQuery =  (typeof (<any>window)['jQuery'] !== 'undefined') && (ng.element === window.jQuery);
  }
  private getTouchAction() {
    const testEl = document.createElement('div');
    const vendorPrefixes = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];

    for (let i = 0; i < vendorPrefixes.length; i++) {
      const prefix = vendorPrefixes[i];
      const property = prefix ? prefix + 'TouchAction' : 'touchAction';
      // if (ng.isDefined(testEl.style[property])) {
        // return property;
     // }
    }
  }
}

export class MdGestureHandler {
  private options: any = {};
  constructor() {
    // asdsad
  }
  public setOptions(opt: any = {}) {
    ng.extend(this.options, opt);
  }
  public dispatchEvent(srcEvent: any, eventType: any, eventPointer: any) {
    eventPointer = eventPointer || pointer;
    let eventObj: any;

    if (eventType === 'click' || eventType === 'mouseup' || eventType === 'mousedown' ) {
      eventObj = document.createEvent('MouseEvents');
      eventObj.initMouseEvent(
        eventType, true, true, window, srcEvent.detail,
        eventPointer.x, eventPointer.y, eventPointer.x, eventPointer.y,
        srcEvent.ctrlKey, srcEvent.altKey, srcEvent.shiftKey, srcEvent.metaKey,
        srcEvent.button, srcEvent.relatedTarget || null
      );

    } else {
      eventObj = document.createEvent('CustomEvent');
      eventObj.initCustomEvent(eventType, true, true, {});
    }
    eventObj.$material = true;
    eventObj.pointer = eventPointer;
    eventObj.srcEvent = srcEvent;
    eventPointer.target.dispatchEvent(eventObj);
  }
}



