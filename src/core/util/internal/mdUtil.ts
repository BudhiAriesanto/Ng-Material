import * as ng from 'angular';
import { Prefixer } from '../prefixer';
import { DisableScrollAround } from '../disableScrollAround';
import { IMDUtilServices } from '..';
import { IRxJsService } from '../../rxjs';
import { isObject, isFunction } from 'util';
import { MdAnimateService } from 'src/core/animate';
import { MdIterator } from '../iterator';


interface INgService {
  $document: ng.IDocumentService;
  $timeout: ng.ITimeoutService;
  $compile: ng.ICompileService;
  $rootScope: ng.IRootScopeService;
  $$mdAnimate: MdAnimateService;
  $interpolate: ng.IInterpolateService;
  $log: ng.ILogService;
  $rootElement?: ng.IRootElementService;
  $window: ng.IWindowService;
  $$rAF: any;
  $rx: IRxJsService;
  $injector: ng.auto.IInjectorService;
}


/*
 * This var has to be outside the angular factory, otherwise when
 * there are multiple material apps on the same page, each app
 * will create its own instance of this array and the app's IDs
 * will not be unique.
 */
let nextUniqueId = 0;

export class MDUtil {
  private userAgent: string = navigator.userAgent || navigator.vendor || (<any>window).opera;
  private isIOS: boolean = (this.userAgent.match(/ipad|iphone|ipod/i) ? true : false );
  private isAndroid: boolean = ( this.userAgent.match(/android/i) ? true : false );
  private isChrome: boolean = /Chrome/.test(this.userAgent);
  private isMozilla: boolean = (this.userAgent.match(/Firefox\/([0-9]+)\./) ? true : false);
  private isEdge: boolean = /Edge/.test(this.userAgent);
  private startSymbol: string;
  private endSymbol: string;
  private useStandardSymbol: boolean;
  private ngService: INgService;
  private MDUtilServices: IMDUtilServices;
  static Factory = (...args: any[]): any => {
    return new MDUtil(args).MDUtilServices;
  }
  constructor(args: any[]) {
    this.ngService =  {
      $document: args[0],
      $timeout: args[1],
      $compile: args[2],
      $rootScope: args[3],
      $$mdAnimate: args[4],
      $interpolate: args[5],
      $log: args[6],
      $window: args[7],
      $$rAF: args[8],
      $rx: args[9],
      $injector: args[10]
    };
    /**
     * Since removing jQuery from the demos, some code that uses `element.focus()` is broken.
     * We need to add `element.focus()`, because it's testable unlike `element[0].focus`.
     */
    ng.element.prototype.focus = ng.element.prototype.focus || function() {
      if (this.length) {
        this[0].focus();
      }
      return this;
    };
    ng.element.prototype.blur = ng.element.prototype.blur || function() {
      if (this.length) {
        this[0].blur();
      }
      return this;
    };
    // this.userAgent = navigator.userAgent || navigator.vendor || (<any>window).opera;
    const { $interpolate } = this.ngService;
    this.startSymbol = $interpolate.startSymbol();
    this.endSymbol = $interpolate.endSymbol();
    this.useStandardSymbol = ((this.startSymbol === '{{') && (this.endSymbol === '}}'));
    this.MDUtilServices = ((factory: MDUtil): IMDUtilServices => {
      const { $$mdAnimate, $window, $document, $timeout, $rootScope, $compile, $rx, $injector } = factory.ngService;
      return {
        dom: {
          animator: $$mdAnimate
        },
        dsa: undefined,
        isIOS: factory.isIOS,
        isAndroid: factory.isAndroid,
        isChrome: factory.isChrome,
        isMozilla: factory.isMozilla,
        isEdge: factory.isEdge,
        disableScrollAround: function(element?: any, parent?: any, options?: any) {
          if (!this.dsa) {
            this.dsa = new DisableScrollAround(this);
          }
          const dsa: DisableScrollAround = this.dsa;
          return dsa.disableScrollAround(element, parent, options);
        },
        getNativeElement(element: JQLite ): HTMLElement {
          const el: HTMLElement =  (element[0] || element) as HTMLElement;
          return el.nodeType ? el : undefined;
        },
        hasComputedStyle (target: JQLite | HTMLElement, key: any, expectedVal?: string, defaultVal?: string): string | boolean {
          let hasValue = false;
          const el: HTMLElement = this.getNativeElement(target);
          const computedStyles: CSSStyleDeclaration = $window.getComputedStyle(el);
          hasValue = ng.isDefined(computedStyles[key]) && (expectedVal ? computedStyles[key] === expectedVal : true);
          return (hasValue ? computedStyles.color : (defaultVal ? defaultVal : false));
        },
        now: window.performance && window.performance.now ?
          ng.bind(window.performance, window.performance.now) : Date.now || function() {
          return new Date().getTime();
        },
        getModelOption: (ngModelCtrl: ng.INgModelController, optionName: any): any => {
          return ngModelCtrl.$overrideModelOptions;
        },
        bidi : function(element: any, property: any, lValue: any, rValue: any) {
          const ltr = !($document[0].dir === 'rtl' || $document[0].body.dir === 'rtl');
          // If accessor
          if ( arguments.length === 0 ) {
            return ltr ? 'ltr' : 'rtl';
          }
          // If mutator
          const elem = ng.element(element);
          if ( ltr && ng.isDefined(lValue)) {
            elem.css(property, factory.validateCssValue(lValue));
          } else if ( !ltr && ng.isDefined(rValue)) {
            elem.css(property, factory.validateCssValue(rValue) );
          }
        },
        bidiProperty: function (element: Element | string, lProperty: any, rProperty: any, value: any) {
          const ltr = !($document[0].dir === 'rtl' || $document[0].body.dir === 'rtl');
          const elem = ng.element(element);
          if ( ltr && ng.isDefined(lProperty)) {
            elem.css(lProperty, factory.validateCssValue(value));
            elem.css(rProperty, '');
          } else if ( !ltr && ng.isDefined(rProperty)) {
            elem.css(rProperty, factory.validateCssValue(value) );
            elem.css(lProperty, '');
          }
        },
        clientRect: function(element: JQLite | HTMLElement, offsetParent?: JQLite | HTMLElement , isOffsetRect: boolean = false) {
          const node: HTMLElement = this.getNativeElement(element);
          const nodeRect: ClientRect = node.getBoundingClientRect();
          offsetParent = this.getNativeElement(offsetParent || node.offsetParent || document.body) as HTMLElement;
          // The user can ask for an offsetRect: a rect relative to the offsetParent,
          // or a clientRect: a rect relative to the page
          const offsetRect: ClientRect = isOffsetRect ? offsetParent.getBoundingClientRect() : {left: 0, top: 0, width: 0, height: 0} as ClientRect;
          return {
            left: nodeRect.left - offsetRect.left,
            top: nodeRect.top - offsetRect.top,
            width: nodeRect.width,
            height: nodeRect.height,
            bottom: 0,
            right: 0
          };
        },
        // Annoying method to copy nodes to an array, thanks to IE
        nodesToArray: function(nodes: NodeList) {
          nodes = (nodes || []) as NodeList;
          const results = [];
          for (let i = 0; i < nodes.length; ++i) {
            results.push(nodes.item(i));
          }
          return results;
        },
        valueOnUse : function (scope: any, key: string, getter: Function) {
          let value: any = null, args = Array.prototype.slice.call(arguments);
          const params = (args.length > 3) ? args.slice(3) : [ ];
          Object.defineProperty(scope, key, {
            get: function () {
              if (value === null) {
                value = getter.apply(scope, params);
              }
              return value;
            }
          });
        },
        nextUid: function() {
          return '' + nextUniqueId++;
        },
        getParentWithPointerEvents: function (element: JQLite): any {
          let parent: JQLite = element.parent();
          // jqLite might return a non-null, but still empty, parent; so check for parent and length
          while (this.hasComputedStyle(parent, 'pointer-events', 'none')) {
            parent = parent.parent();
          }
          return parent;
        },
        nextTick: function(callback: Function, digest: boolean = false, scope?: any): any {
          // grab function reference for storing state details
          const nextTick = this.nextTick;
          const timeout = nextTick.timeout;
          const queue = nextTick.queue || [];
          // add callback to the queue
          queue.push({scope: scope, callback: callback});
          // set default value for digest
          if (digest == null) {
            digest = true;
          }
          // store updated digest/queue values
          nextTick.digest = nextTick.digest || digest;
          nextTick.queue = queue;
          // either return existing timeout or create a new one
          return timeout || (nextTick.timeout = $timeout(processQueue, 0, false));
          /**
           * Grab a copy of the current queue
           * Clear the queue for future use
           * Process the existing queue
           * Trigger digest if necessary
           */
          function processQueue() {
            const queue = nextTick.queue;
            const digest = nextTick.digest;
            nextTick.queue = [];
            nextTick.timeout = null;
            nextTick.digest = false;
            queue.forEach(function(queueItem: any) {
              const skip = queueItem.scope && queueItem.scope.$$destroyed;
              if (!skip) {
                queueItem.callback();
              }
            });
            if (digest) {
              $rootScope.$digest();
            }
          }
        },
        prefixer: function (initialAttributes?: string, buildSelector?: boolean) {
          const prefixer = new Prefixer(this);
          if (initialAttributes) {
            return buildSelector ?  prefixer.buildSelector(initialAttributes) : prefixer.buildList(initialAttributes);
          }
          return prefixer;
        },
        findFocusTarget: function(containerEl: any, attributeVal?: any) {
          const AUTO_FOCUS = this.prefixer('md-autofocus', true);
          let elToFocus = scanForFocusable(containerEl, attributeVal || AUTO_FOCUS);
          if ( !elToFocus && attributeVal !== AUTO_FOCUS) {
            // Scan for deprecated attribute
            elToFocus = scanForFocusable(containerEl, this.prefixer('md-auto-focus', true));
            if ( !elToFocus ) {
              // Scan for fallback to 'universal' API
              elToFocus = scanForFocusable(containerEl, AUTO_FOCUS);
            }
          }
          return elToFocus;
          /**
           * Can target and nested children for specified Selector (attribute)
           * whose value may be an expression that evaluates to True/False.
           */
          function scanForFocusable(target: any, selector: any) {
            let elFound, items = target[0].querySelectorAll(selector);
            // Find the last child element with the focus attribute
            if ( items && items.length ) {
                ng.forEach(items, function(it: any) {
                it = ng.element(it);
                // Check the element for the md-autofocus class to ensure any associated expression
                // evaluated to true.
                const isFocusable = it.hasClass('md-autofocus');
                if (isFocusable) {
                  elFound = it;
                }
              });
            }
            return elFound;
          }
        },
        getClosest: function getClosest(el: any, validateWith: any, onlyParent: any) {
          if ( ng.isString(validateWith) ) {
            const tagName = validateWith.toUpperCase();
            validateWith = function(el: any) {
              return el.nodeName.toUpperCase() === tagName;
            };
          }
          el = this.getNativeElement(el);
          if (onlyParent) {
            el = el.parentNode;
          }
          if (!el) {
            return null;
          }
          do {
            if (validateWith(el)) {
              return el;
            }
          } while (el = el.parentNode);
          return null;
        },
        createBackdrop: function(scope: any, addClass: string) {
          return $compile(this.supplant('<md-backdrop class="{0}">', [addClass]))(scope);
        },
        parseAttributeBoolean: function(value: any, negatedCheck: any): boolean {
          return value === '' || !!value && (negatedCheck === false || value !== 'false' && value !== '0');
        },
        supplant: function(template: string, values: any, pattern: any): any {
          pattern = pattern || /\{([^{}]*)\}/g;
          return template.replace(pattern, function(a: any, b: any) {
            let p = b.split('.'), r = values;
            try {
              for (const s in p) {
                if (p.hasOwnProperty(s) ) {
                  r = r[p[s]];
                }
              }
            } catch (e) {
              r = a;
            }
            return (typeof r === 'string' || typeof r === 'number') ? r : a;
          });
        },
        getViewportTop: function(): number {
          return window.scrollY || window.pageYOffset || 0;
        },
        preventDefault: function(e: any) {
            e.preventDefault();
        },
        debounce: function(callback: Function, wait: number, scope: ng.IScope, invokeApply: boolean) {
          const debounce = $rx.of(callback);
          const { debounceTime } = $rx.operators;
          return function() {
            const args: any = Array.prototype.slice.call(arguments);
            debounce.pipe(
              debounceTime(wait || 10)
            ).subscribe((res: Function) => {
              res.apply(scope, args);
              if (invokeApply) {
                scope.$apply();
                scope.$digest();
              }
            });
          };
        },
        fakeNgModel: function() {
          return {
            $fake: true,
            $setTouched: ng.noop,
            $setViewValue: function(value: any) {
              this.$viewValue = value;
              this.$render(value);
              this.$viewChangeListeners.forEach(function(cb: any) {
                cb();
              });
            },
            $isEmpty: function(value: any) {
              return ('' + value).length === 0;
            },
            $parsers: [],
            $formatters: [],
            $viewChangeListeners: [],
            $render: ng.noop
          };
        },
        // replace $injector.instantiate on minify JS
        instantiate: function(fn: Function, locals: any = new Object()): any {
          const injector = ng.injector(['ng', 'ng.material']);
          let annotate: Array<any> = [...fn.$inject];
          annotate = annotate.map( key => {
            return  locals[key] ? locals[key] : injector.get(key);
          });

          const constructor: any = function() {
            const f: any = function () {
              fn.apply(this, annotate);
            };
            f.prototype = fn.prototype;
            return new f();
          };
          const result = constructor.apply();
          return isObject(result) || isFunction(result) ? result : constructor;
        },
        centerPointByRect(rect: ClientRect): {x: number, y: number} {
          return {
            x: Math.round(rect.left + (rect.width / 2)),
            y: Math.round(rect.top + (rect.height / 2))
          };
        },
        iterator(items: Array<any>, reloop: boolean = false): MdIterator {
          return new MdIterator(items, reloop);
        },
        /**
         * Processes a template and replaces the start/end symbols if the application has
         * overridden them.
         *
         * @param template The template to process whose start/end tags may be replaced.
         * @returns {*}
         */
        processTemplate: function(template: any): any {
          if (factory.useStandardSymbol) {
            return template;
          } else {
            if (!template || !ng.isString(template)) {
              return template;
            }
            return template.replace(/\{\{/g, factory.startSymbol).replace(/}}/g, factory.endSymbol);
          }
        },
      } as IMDUtilServices;
    })(this);
    this.ngService.$$mdAnimate.init(this.MDUtilServices);
  }
  private validateCssValue(value: any): string {
    return !value       ? '0'   :
      this.hasPx(value) || this.hasPercent(value) ? value : value + 'px';
  }
  private hasPx(value: any) {
    return String(value).indexOf('px') > -1;
  }

  private hasPercent(value: any) {
    return String(value).indexOf('%') > -1;
  }
  // private isIOS = (): any => this.userAgent.match(/ipad|iphone|ipod/i);
 // private isAndroid = (): any => this.userAgent.match(/android/i);
}

MDUtil.Factory.$inject = ['$document', '$timeout', '$compile', '$rootScope', '$$mdAnimate', '$interpolate', '$log', '$window', '$$rAF', '$rx', '$injector'];
