import * as ng from 'angular';
import { IMDUtilServices } from './util';
import { NgService, method } from './decorator';
enum EventMap {
  $keydown = 'keyboard',
  $mousedown = 'mouse',
  $mouseenter = 'mouse',
  $touchstart = 'touch',
  $pointerdown = 'pointer',
  $MSPointerDown = 'pointer',
  $2 = 'touch',
  $3 = 'touch',
  $4 = 'mouse'
}
@NgService('$mdInteraction')
export class MdInteractionService {
  private bodyElement: JQLite = ng.element(document.body);
  private isBuffering = false;
  private bufferTimeout: ng.IPromise<any>;
  private lastInteractionType: string = null;
  private lastInteractionTime: number = null;
  constructor(private $timeout: ng.ITimeoutService, private $mdUtil: IMDUtilServices) {
    'ngInject';
    this.initializeEvents();
  }

  /**
   * Initializes the interaction service, by registering all interaction events to the
   * body element.
   */
  private initializeEvents() {
    // IE browsers can also trigger pointer events, which also leads to an interaction.
    const pointerEvent: string = 'MSPointerEvent' in window ? 'MSPointerDown' : 'PointerEvent' in window ? 'pointerdown' : null;

    this.bodyElement.on('keydown mousedown', this.onInputEvent.bind(this));

    if ('ontouchstart' in document.documentElement) {
      this.bodyElement.on('touchstart', this.onBufferInputEvent.bind(this));
    }

    if (pointerEvent) {
      this.bodyElement.on(pointerEvent, this.onInputEvent.bind(this));
    }
  }

  /**
   * Event listener for normal interaction events, which should be tracked.
   * @param event {MouseEvent|KeyboardEvent|PointerEvent|TouchEvent}
   */
  private onInputEvent(event: MouseEvent | KeyboardEvent | PointerEvent | TouchEvent) {
    if (this.isBuffering) {
      return;
    }
    let type: string = (<any>EventMap)[`$${event.type}`];
    if (type === 'pointer') {
      type = (<any>EventMap)[`$${(<PointerEvent>event).pointerType}`] || (<PointerEvent>event).pointerType;
    }
    this.lastInteractionType = type;
    this.lastInteractionTime = this.$mdUtil.now();
  }

  /**
   * Event listener for interaction events which should be buffered (touch events).
   * @param event {TouchEvent}
   */
  private onBufferInputEvent(event: TouchEvent) {
    this.$timeout.cancel(this.bufferTimeout);

    this.onInputEvent(event);
    this.isBuffering = true;

    // The timeout of 650ms is needed to delay the touchstart, because otherwise the touch will call
    // the `onInput` function multiple times.
    this.bufferTimeout = this.$timeout(function() {
      this.isBuffering = false;
    }.bind(this), 650, false);
  }

  /**
   * @ngdoc method
   * @name $mdInteraction#getLastInteractionType
   * @description Retrieves the last interaction type triggered in body.
   * @returns {string|null} Last interaction type.
   */
  @method
  public getLastInteractionType(): string {
    return this.lastInteractionType;
  }

  /**
   * @ngdoc method
   * @name $mdInteraction#isUserInvoked
   * @description Method to detect whether any interaction happened recently or not.
   * @param {number=} checkDelay Time to check for any interaction to have been triggered.
   * @returns {boolean} Whether there was any interaction or not.
   */
  @method
  public isUserInvoked(checkDelay: number): boolean {
    const delay = ng.isNumber(checkDelay) ? checkDelay : 15;
    // Check for any interaction to be within the specified check time.
    return this.lastInteractionTime >= this.$mdUtil.now() - delay;
  }
}
