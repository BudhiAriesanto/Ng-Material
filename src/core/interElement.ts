import * as ng from 'angular';
import { NgProvider, method } from './decorator';
import { IMDUtilServices } from './util';
import { MdCompilerServices, MdCompilerProvider } from './compiler';

export type MD_EXPOSE_METHOD = Array<'onHide' | 'onShow' | 'onRemove' | string>;
export interface IInterimDefinition {
  options?: Array<any> | Function;
  methods?: Array<any>;
  argOption?: Array<any>;
}
export interface IInterimOptions {
  optionsFactory: Array<any> | Function;
  methods: MD_EXPOSE_METHOD;
  argOption?: Array<any>;
}
export interface IInterimPreset {
  [name: string]: IInterimOptions;
}
export interface IInterimProviderConfig extends IInterimOptions {
  presets: IInterimPreset;
}

export class InterimElementProvider {
  private EXPOSED_METHODS: MD_EXPOSE_METHOD = ['onHide', 'onShow', 'onRemove'];
  private customMethods: any = {};
  private providerConfig: IInterimProviderConfig = {
      presets: {},
      optionsFactory: [],
      methods: this.EXPOSED_METHODS
  };
  constructor(private interimFactoryName: string) {
    this.addPreset('build', {
      methods: ['controller', 'controllerAs', 'resolve', 'multiple',
        'template', 'templateUrl', 'themable', 'transformTemplate', 'parent', 'contentElement']
    });
  }
  /**
   * Save the configured preset to be used when the factory is instantiated
   */
  public addPreset(name: string, definition: IInterimDefinition = {}): InterimElementProvider {
    definition.methods = definition.methods || [];
    definition.options = definition.options || function() { return {}; };

    if (/^cancel|hide|show$/.test(name)) {
      throw new Error(`Preset ${name} in ${this.interimFactoryName} is reserved!`);
    }
    if (definition.methods.indexOf('_options') > -1) {
      throw new Error(`Method '_options' in ${this.interimFactoryName} is reserved!`);
    }
    this.providerConfig.presets[name] = {
      methods: [...this.EXPOSED_METHODS, ...definition.methods],
      optionsFactory: definition.options,
      argOption: definition.argOption
    };
    return this;
  }
  /**
   * Save the configured defaults to be used when the factory is instantiated
   */
  public setDefaults(definition: IInterimDefinition): InterimElementProvider {
    this.providerConfig.optionsFactory = definition.options;
    this.providerConfig.methods.push(...definition.methods || []);
    return this;
  }

  /**
   * Add a method to the factory that isn't specific to any interim element operations
   */
  public addMethod(name: string, fn: Function): InterimElementProvider {
    this.customMethods[name] = fn;
    return this;
  }


}
class InterimElement {
  private $q: ng.IQService;
  private $mdUtil: IMDUtilServices;
  private $rootScope: ng.IRootScopeService;
  private $animate: ng.animate.IAnimateService;
  private $mdCompiler: MdCompilerServices;
  private $mdTheming: any;
  private $rootElement: JQLite;
  private $timeout: ng.ITimeoutService;
  private element: JQLite;
  private showAction: ng.IPromise<any> = this.$q.when(true);
  public service: any;
  public showPromises: Array<any> = []; // Promises for the interim's which are currently opening.
  public hidePromises: Array<any> = []; // Promises for the interim's which are currently hiding.
  public showingInterims: Array<any> = []; // Interim elements which are currently showing up.
  public deferred: ng.IDeferred<any> = this.$q.defer();
  public show =  this.createAndTransitionIn;
  public remove = this.transitionOutAndRemove;
  constructor(private $injector: ng.auto.IInjectorService, public options: any = {}) {
    this.$q = this.$injector.get('$q');
    this.$mdUtil = $injector.get('$mdUtil');
    this.$rootScope = $injector.get('$rootScope');
    this.$animate = $injector.get('$animate');
    this.options = $injector.get('$mdCompiler');
    this.$mdTheming = $injector.get('$mdTheming');
    this.$rootElement = $injector.get('$rootElement');
    this.$timeout = $injector.get('$timeout');
    options = this.configureScopeAndTransitions(options);
  }
  /**
   * Prepare optional isolated scope and prepare $animate with default enter and leave
   * transitions for the new element instance.
   */
  private configureScopeAndTransitions(options: any): any {
    options = options || { };
    if ( options.template ) {
      options.template = this.$mdUtil.processTemplate(options.template);
    }

    return ng.extend({
      preserveScope: false,
      cancelAutoHide : ng.noop,
      scope: options.scope || this.$rootScope.$new(options.isolateScope),

      /**
       * Default usage to enable $animate to transition-in; can be easily overridden via 'options'
       */
      onShow: function transitionIn(scope: ng.IScope, element: any, options: any) {
        return this.$animate.enter(element, options.parent);
      },

      /**
       * Default usage to enable $animate to transition-out; can be easily overridden via 'options'
       */
      onRemove: function transitionOut(scope: ng.IScope, element: JQLite) {
        // Element could be undefined if a new element is shown before
        // the old one finishes compiling.
        return element && this.$animate.leave(element) || this.$q.when();
      }
    }, options );
  }
  /**
   * Compile an element with a templateUrl, controller, and locals
   */
  private compileElement(options: any): ng.IPromise<any> {

    let compiled = !options.skipCompile ? this.$mdCompiler.compile(options) : null;

    return compiled || this.$q(function (resolve: any) {
        resolve({
          locals: {},
          link: function () {
            return options.element;
          }
        });
      });
  }
  /**
   * Search for parent at insertion time, if not specified
   */
  private findParent(element: JQLite, options: any) {
    let parent = options.parent;

    // Search for parent at insertion time, if not specified
    if (typeof parent === 'function') {
      parent = parent(options.scope, element, options);
    } else if (typeof parent === 'string') {
      parent = ng.element(document.querySelector(parent));
    } else {
      parent = ng.element(parent);
    }

    // If parent querySelector/getter function fails, or it's just null,
    // find a default.
    if (!(parent || {}).length) {
      let el;
      if (this.$rootElement[0] && this.$rootElement[0].querySelector) {
        el = this.$rootElement[0].querySelector(':not(svg) > body');
      }
      if (!el) {
        el = this.$rootElement[0];
      }
      if (el.nodeName === '#comment') {
        el = document.body;
      }
      return ng.element(el);
    }

    return parent;
  }
  /**
   *  Link an element with compiled configuration
   */
  private linkElement(compileData: any, options: any) {
    ng.extend(compileData.locals, options);

    let element = compileData.link(options.scope);

    // Search for parent at insertion time, if not specified
    options.element = element;
    options.parent = this.findParent(element, options);
    if (options.themable) {
      this.$mdTheming(element);
    }
    return element;
  }
  /**
   * If auto-hide is enabled, start timer and prepare cancel function
   */
  private startAutoHide() {
    let autoHideTimer: any, cancelAutoHide = ng.noop;
    let self = this;
    if (this.options.hideDelay) {
      autoHideTimer = this.$timeout(this.service.hide, this.options.hideDelay) ;
      cancelAutoHide = function() {
        self.$timeout.cancel(autoHideTimer);
      };
    }

    // Cache for subsequent use
    this.options.cancelAutoHide = function() {
      cancelAutoHide();
      self.options.cancelAutoHide = undefined;
    };
  }
  /**
   * Show the element ( with transitions), notify complete and start
   * optional auto-Hide
   */
  private showElement(element: any, options: any, controller: any) {
    // Trigger onShowing callback before the `show()` starts
    let notifyShowing = options.onShowing || ng.noop;
    // Trigger onComplete callback when the `show()` finishes
    let notifyComplete = options.onComplete || ng.noop;
    let self = this;

    // Necessary for consistency between AngularJS 1.5 and 1.6.
    try {
      notifyShowing(options.scope, element, options, controller);
    } catch (e) {
      return this.$q.reject(e);
    }

    return this.$q(function (resolve: any, reject: any) {
      try {
        // Start transitionIn
        self.$q.when(options.onShow(options.scope, element, options, controller))
          .then(function () {
            notifyComplete(options.scope, element, options);
            self.startAutoHide();

            resolve(element);
          }, reject);

      } catch (e) {
        reject(e.message);
      }
    });
  }
  private hideElement(element: any, options: any) {
    let self = this;
    let announceRemoving = options.onRemoving || ng.noop;

    return this.$q(function (resolve: any, reject: any) {
      try {
        // Start transitionIn
        let action = self.$q.when( options.onRemove(options.scope, element, options) || true );

        // Trigger callback *before* the remove operation starts
        announceRemoving(element, action);

        if (options.$destroy) {
          // For $destroy, onRemove should be synchronous
          resolve(element);

          if (!options.preserveScope && options.scope ) {
            // scope destroy should still be be done after the current digest is done
            action.then( function() { options.scope.$destroy(); });
          }
        } else {
          // Wait until transition-out is done
          action.then(function () {
            if (!options.preserveScope && options.scope ) {
              options.scope.$destroy();
            }

            resolve(element);
          }, reject);
        }
      } catch (e) {
        reject(e.message);
      }
    });
  }

  /**
   * Compile, link, and show this interim element
   * Use optional autoHided and transition-in effects
   */
  private createAndTransitionIn() {
    let self = this;
    return this.$q(function(resolve: any, reject: any) {
      // Trigger onCompiling callback before the compilation starts.
      // This is useful, when modifying options, which can be influenced by developers.
      if ( typeof self.options.onCompiling === 'function' ) {
        self.options.onCompiling(self.options);
      }

      self.compileElement(self.options)
        .then(function( compiledData: any ) {
          self.element = self.linkElement( compiledData, self.options );

          // Expose the cleanup function from the compiler.
          self.options.cleanupElement = compiledData.cleanup;

          self.showAction = self.showElement(self.element, self.options, compiledData.controller)
            .then(resolve, rejectAll);
        }).catch(rejectAll);

      function rejectAll(fault: any) {
        // Force the '$md<xxx>.show()' promise to reject
        self.deferred.reject(fault);

        // Continue rejection propagation
        reject(fault);
      }
    });
  }
  /**
   * After the show process has finished/rejected:
   * - announce 'removing',
   * - perform the transition-out, and
   * - perform optional clean up scope.
   */
  private transitionOutAndRemove(response: any, isCancelled: any, opts: any) {
    let self = this;
    // abort if the show() and compile failed
    if ( !this.element ) {
      return this.$q.when(false);
    }

    this.options = ng.extend(this.options || {}, opts || {});
    if ( this.options.cancelAutoHide ) {
      this.options.cancelAutoHide();
    }
    this.options.element.triggerHandler('$mdInterimElementRemove');

    if ( this.options.$destroy === true ) {

      return this.hideElement(this.options.element, this.options).then(function() {
        if (isCancelled) {
          rejectAll(response);
        } else {
          resolveAll(response);
        }
      });

    } else {
      self.$q.when(this.showAction).finally(function() {
        self.hideElement(self.options.element, self.options).then(function() {
          isCancelled ? rejectAll(response) : resolveAll(response);
        }, rejectAll);
      });

      return self.deferred.promise;
    }


    /**
     * The `show()` returns a promise that will be resolved when the interim
     * element is hidden or cancelled...
     */
    function resolveAll(response: any) {
      self.deferred.resolve(response);
    }

    /**
     * Force the '$md<xxx>.show()' promise to reject
     */
    function rejectAll(fault: any) {
      self.deferred.reject(fault);
    }
  }
}
export class InterimElementServices {
  public hide = this.waitForInterim(this._hide);
  public cancel = this.waitForInterim(this._cancel);
  private SHOW_CANCELLED: boolean = false;
  private service: any = {};
  private showPromises: Array<any> = []; // Promises for the interim's which are currently opening.
  private hidePromises: Array<any> = []; // Promises for the interim's which are currently hiding.
  private showingInterims: Array<any> = []; // Interim elements which are currently showing up.
  constructor(private $document: ng.IDocumentService, private $q: ng.IQService,
              private $rootScope: ng.IRootScopeService, private $timeout: ng.ITimeoutService,
              private $rootElement: any, private $animate: ng.animate.IAnimateService,
              private $mdUtil: IMDUtilServices, private $mdCompiler: MdCompilerServices,
              private $mdTheming: any, private $injector: ng.auto.IInjectorService,
              private $exceptionHandler: ng.IExceptionHandlerService) {

    'ngInject';
 }
 /*
  * @ngdoc method
  * @name $$interimElement.$service#cancel
  * @kind function
  *
  * @description
  * Removes the `$interimElement` from the DOM and rejects the promise returned from `show`
  *
  * @param {*} reason Data to reject the promise with
  * @returns Promise that will be resolved after the element has been removed.
  *
  */
  private _cancel(reason: any, options: any) {
    let self = this;
    let interim = this.showingInterims.pop();
    if (!interim) {
      return this.$q.when(reason);
    }

    let cancelAction = interim
      .remove(reason, true, options || {})
      .catch(function(reason: any) { return reason; })
      .finally(function() {
        self.hidePromises.splice(self.hidePromises.indexOf(cancelAction), 1);
      });

    self.hidePromises.push(cancelAction);

    // Since AngularJS 1.6.7, promises will be logged to $exceptionHandler when the promise
    // is not handling the rejection. We create a pseudo catch handler, which will prevent the
    // promise from being logged to the $exceptionHandler.
    return interim.deferred.promise.catch(ng.noop);
  }
 /*
   * @ngdoc method
   * @name $$interimElement.$service#hide
   * @kind function
   *
   * @description
   * Removes the `$interimElement` from the DOM and resolves the promise returned from `show`
   *
   * @param {*} resolveParam Data to resolve the promise with
   * @returns a Promise that will be resolved after the element has been removed.
   *
   */
  private _hide(reason: any, options: any) {
    options = options || {};
    let self = this;
    if (options.closeAll) {
      // We have to make a shallow copy of the array, because otherwise the map will break.
      return this.$q.all(this.showingInterims.slice().reverse().map(closeElement));
    } else if (options.closeTo !== undefined) {
      return this.$q.all(this.showingInterims.slice(options.closeTo).map(closeElement));
    }

    // Hide the latest showing interim element.
    return closeElement(this.showingInterims[self.showingInterims.length - 1]);

    function closeElement(interim: any) {

      if (!interim) {
        return self.$q.when(reason);
      }

      let hideAction = interim
        .remove(reason, false, options || { })
        .catch(function(reason: any) { return reason; })
        .finally(function() {
          self.hidePromises.splice(self.hidePromises.indexOf(hideAction), 1);
        });

      self.showingInterims.splice(self.showingInterims.indexOf(interim), 1);
      self.hidePromises.push(hideAction);

      return interim.deferred.promise;
    }
  }
  /**
   * Creates a function to wait for at least one interim element to be available.
   * @param callbackFn Function to be used as callback
   * @returns {Function}
   */
  private waitForInterim(callbackFn: Function) {
    let self = this;
    return function() {
      let fnArguments = arguments;

      if (!self.showingInterims.length) {
        // When there are still interim's opening, then wait for the first interim element to
        // finish its open animation.
        if (self.showPromises.length) {
          return self.showPromises[0].finally(function () {
            return callbackFn.apply(self.service, fnArguments);
          });
        }

        return self.$q.when(`No interim elements currently showing up.`);
      }

      return callbackFn.apply(this.service, fnArguments);
    };
  }
 /*
  * @ngdoc method
  * @name $$interimElement.$service#show
  * @kind function
  *
  * @description
  * Adds the `$interimElement` to the DOM and returns a special promise that will be resolved or rejected
  * with hide or cancel, respectively. To external cancel/hide, developers should use the
  *
  * @param {*} options is hashMap of settings
  * @returns a Promise
  *
  */
  public show(options: any): ng.IPromise<any> {
    let self = this;
    options = options || {};
    let interimElement: InterimElement = new InterimElement(this.$injector, options || {});
    let { service, showPromises, hidePromises, showingInterims } = interimElement;
    service = this.service;
    showPromises = this.showPromises;
    hidePromises = this.hidePromises;
    showingInterims = this.showingInterims;
    // When an interim element is currently showing, we have to cancel it.
    // Just hiding it, will resolve the InterimElement's promise, the promise should be
    // rejected instead.
    let hideAction: ng.IPromise<any> = options.multiple ? this.$q.resolve() : this.$q.all(this.showPromises);

    if (!options.multiple) {
      // Wait for all opening interim's to finish their transition.
      hideAction = hideAction.then(function() {
        // Wait for all closing and showing interim's to be completely closed.
        let promiseArray = this.hidePromises.concat(this.showingInterims.map(this.service.cancel));
        return this.$q.all(promiseArray);
      });
    }
    let showAction = hideAction.then(function() {

      return interimElement
        .show()
        .catch(function(reason: any) { return reason; })
        .finally(function() {
          self.showPromises.splice(self.showPromises.indexOf(showAction), 1);
          self.showingInterims.push(interimElement);
        });

    });

    this.showPromises.push(showAction);

    // In AngularJS 1.6+, exceptions inside promises will cause a rejection. We need to handle
    // the rejection and only log it if it's an error.
    interimElement.deferred.promise.catch(function(fault: any) {
      if (fault instanceof Error) {
        self.$exceptionHandler(fault);
      }

      return fault;
    });

    // Return a promise that will be resolved when the interim
    // element is hidden or cancelled...
    return interimElement.deferred.promise;
  }
}
export class MdInterimElementProvider {
  constructor() {
    'ngInject';
  }
  @method
  public create(interimFactoryName: string): InterimElementProvider {
    return new InterimElementProvider(interimFactoryName);
  }
}
@NgProvider(MdInterimElementProvider)
export class MdInterimElementService extends MdInterimElementProvider {
  constructor(private $document: ng.IDocumentService, private $q: ng.IQService,
              private $rootScope: ng.IRootScopeService, private $timeout: ng.ITimeoutService,
              private $rootElement: any, private $animate: ng.animate.IAnimateService,
              private $mdUtil: IMDUtilServices, private $mdCompiler: MdCompilerServices,
              private $mdTheming: any, private $injector: ng.auto.IInjectorService,
              private $exceptionHandler: ng.IExceptionHandlerService) {
    'ngInject';
    super();
  }
  @method
  public createServices(): InterimElementServices {
    return new InterimElementServices(this.$document, this.$q, this.$rootScope, this.$timeout, this.$rootElement, this.$animate, this.$mdUtil, this.$mdCompiler, this.$mdTheming, this.$injector, this.$exceptionHandler );
  }
}
