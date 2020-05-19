import { Prefixer } from './prefixer';
import { DisableScrollAround } from './disableScrollAround';
import { NgModule } from 'angular-ts-decorators';
import { MDUtil } from './internal';
import { MdAnimateService } from '../animate';
import { MdColorServices } from './color';
import { MdIterator } from './iterator';
export { DisableScrollAround, Prefixer } ;

@NgModule({
  id: 'ng.material.core.util',
  imports: ['ng', 'ngAnimate'],
  providers: [
    MdColorServices,
    {provide: '$mdUtil', useFactory: MDUtil.Factory},
  ]
})
export default class MaterialCoreUtil {
  static config() {
    'ngInject';
  }
  static run() {
    'ngInject';
  }
}

// tslint:disable:no-var-requires ;
export interface IMDUtilServices {
  dom: {
    animator: MdAnimateService;
  };
  now: DateConstructor | Function;
  dsa: DisableScrollAround;
  isIOS: boolean;
  isAndroid: boolean;
  isChrome: boolean;
  isMozilla: boolean;
  isEdge: boolean;
  /**
   * Checks if the target element has the requested style by key
   * @param {DOMElement|JQLite} target Target element
   * @param {string} key Style key
   * @param {string=} expectedVal Optional expected value
   * @returns {boolean} Whether the target element has the style or not
   */
  hasComputedStyle(target: JQLite | HTMLElement, key: any, expectedVal?: string, defaultVal?: string): string | boolean;
  /**
   * Cross-version compatibility method to retrieve an option of a ngModel controller,
   * which supports the breaking changes in the AngularJS snapshot (SHA 87a2ff76af5d0a9268d8eb84db5755077d27c84c).
   * @param {!angular.ngModelCtrl} ngModelCtrl
   * @param {!string} optionName
   * @returns {Object|undefined}
   */
  getModelOption?(...args: any[]): any;
  /**
   * Bi-directional accessor/mutator used to easily update an element's
   * property based on the current 'dir'ectional value.
   */
  bidi(...args: any[]): any;
  bidiProperty(...args: any[]): void;
  clientRect(element: JQLite | HTMLElement, offsetParent?: JQLite | HTMLElement , isOffsetRect?: boolean): ClientRect;
  nodesToArray(...args: any[]): any;
   /**
    * Create an implicit getter that caches its `getter()`
    * lookup value
    */
  valueOnUse(scope: any, key: string, getter: Function | ClassDecorator): any;
   /**
    * Get a unique ID.
    *
    * @returns {string} an unique numeric string
    */
  nextUid(): void;
  /**
   * Scan up dom hierarchy for enabled parent;
   */
  getParentWithPointerEvents(element: JQLite): any;
  /**
   * Alternative to $timeout calls with 0 delay.
   * nextTick() coalesces all calls within a single frame
   * to minimize $digest thrashing
   *
   * @param {Function} callback function to be called after the tick
   * @param {boolean} digest true to call $rootScope.$digest() after callback
   * @param scope scope associated with callback. If the scope is destroyed, the callback will
   *  be skipped.
   * @returns {*}
   */
  nextTick(callback: Function, digest: boolean, scope?: any): any;
  /**
   * Finds the proper focus target by searching the DOM.
   *
   * @param containerEl
   * @param attributeVal
   * @returns {*}
   */
  findFocusTarget(...args: any[]): any;
  /**
   * getClosest replicates jQuery.closest() to walk up the DOM tree until it finds a matching nodeName
   *
   * @param {JQLite | HTMLElement} el Element to start walking the DOM from
   * @param {string} validateWith a string or a function. If a string is passed, it will be evaluated against
   * each of the parent nodes' tag name. If a function is passed, the loop will call it with each of
   * the parents and will use the return value to determine whether the node is a match.
   * @param onlyParent Only start checking from the parent element, not `el`.
   * @returns {boolean}
   */
  getClosest(...args: any[]): boolean;
  /**
   * facade to build md-backdrop element with desired styles
   * NOTE: Use $compile to trigger backdrop postLink function
   */
  createBackdrop(...args: any[]): any;
  /**
   * Parses an attribute value, mostly a string.
   * By default checks for negated values and returns `false´ if present.
   * Negated values are: (native falsy) and negative strings like:
   * `false` or `0`.
   * @param value Attribute value which should be parsed.
   * @param negatedCheck When set to false, won't check for negated values.
   * @returns {boolean}
   */
  parseAttributeBoolean(...arg: any[]): boolean;
  prefixer(initialAttributes?: string, buildSelector?: boolean): Prefixer | any;
  /**
   * supplant() method from Crockford's `Remedial Javascript`
   * Equivalent to use of $interpolate; without dependency on
   * interpolation symbols and scope. Note: the '{<token>}' can
   * be property names, property chains, or array indices.
   */
  supplant(...args: any[]): any;
  /**
   * Disables scroll around the passed parent element.
   * @param element Unused
   * @param {!Element|!angular.JQLite} parent Element to disable scrolling within.
   *   Defaults to body if none supplied.
   * @param options Object of options to modify functionality
   *   - disableScrollMask Boolean of whether or not to create a scroll mask element or
   *     use the passed parent element.
   */
  disableScrollAround(...args: any[]): any;
  /**
   * Transforms a jqLite or DOM element into a HTML element.
   * This is useful when supporting jqLite elements and DOM elements at
   * same time.
   * @param element {JQLite|Element} Element to be parsed
   * @returns {HTMLElement} Parsed HTMLElement
   */
  getNativeElement(element: JQLite ): HTMLElement;
  /**
   * Determines the absolute position of the viewport.
   * Useful when making client rectangles absolute.
   * @returns {number}
   */
  getViewportTop(): number;
  preventDefault(e: any): void;
  /**
   * @param {Function} callback
   * @param {number} wait Integer value of msecs to delay (since last debounce reset); default value 10 msecs
   * @param {any} scope
   * @param invokeApply should the $timeout trigger $digest() dirty checking
   * @returns {Function} callback Returns a function, that, as long as it continues to be invoked, will not
   * be triggered. The function will be called after it stops being called for N milliseconds.
   */
  debounce(callback: Function, wait: number, scope?: any, invokeApply?: boolean): any;
  fakeNgModel(): any;
  // instantiate(typeConstructor: Function, locals?: any): any;
  instantiate<T>(typeConstructor: {new(...args: any[]): T}, locals?: any): T;
  centerPointByRect(rect: ClientRect): {x: number, y: number};
  /**
   * iterator is a list facade to easily support iteration and accessors
   *
   * @param items Array list which this iterator will enumerate
   * @param reloop Boolean enables iterator to consider the list as an endless reloop
   */
  iterator(items: Array<any>, reloop: boolean): MdIterator;
  /**
   * Processes a template and replaces the start/end symbols if the application has
   * overridden them.
   *
   * @param template The template to process whose start/end tags may be replaced.
   * @returns {*}
   */
  processTemplate(template: any): any;


}

