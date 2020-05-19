/*!
 * AngularJS Material Design
 * https://github.com/angular/material
 * @license MIT
 * v1.1.10
 */
(function( window, angular, undefined ){
"use strict";


(function(){
"use strict";

/**
 * Initialization function that validates environment
 * requirements.
 */
DetectNgTouch.$inject = ["$log", "$injector"];
rAFDecorator.$inject = ["$delegate"];
qDecorator.$inject = ["$delegate"];
angular
  .module('material.core.js', [
    'ng.material.core.util',
    // 'material.core.animate',
    // 'material.core.layout',
    // 'material.core.interaction',
    // 'material.core.gestures',
    'material.core.theming',
    // 'material.core.theming.palette'
  ])
  .config(MdCoreConfigure)
  .run(DetectNgTouch);


/**
 * Detect if the ng-Touch module is also being used.
 * Warn if detected.
 * @ngInject
 */
function DetectNgTouch($log, $injector) {
  if ( $injector.has('$swipe') ) {
    const msg = "" +
      "You are using the ngTouch module. \n" +
      "AngularJS Material already has mobile click, tap, and swipe support... \n" +
      "ngTouch is not supported with AngularJS Material!";
    $log.warn(msg);
  }
}

/**
 * @ngInject
 */
MdCoreConfigure.$inject = ["$provide", "$mdThemingProvider"];
function MdCoreConfigure($provide, $mdThemingProvider) {
  $provide.decorator('$$rAF', ['$delegate', rAFDecorator]);
  $provide.decorator('$q', ['$delegate', qDecorator]);

  $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('pink')
    .warnPalette('deep-orange')
    .backgroundPalette('grey');
}

/**
 * @ngInject
 */
function rAFDecorator($delegate) {
  /**
   * Use this to throttle events that come in often.
   * The throttled function will always use the *last* invocation before the
   * coming frame.
   *
   * For example, window resize events that fire many times a second:
   * If we set to use an raf-throttled callback on window resize, then
   * our callback will only be fired once per frame, with the last resize
   * event that happened before that frame.
   *
   * @param {function} callback function to debounce
   */
  $delegate.throttle = function(cb) {
    let queuedArgs, alreadyQueued, queueCb, context;
    return function debounced() {
      queuedArgs = arguments;
      context = this;
      queueCb = cb;
      if (!alreadyQueued) {
        alreadyQueued = true;
        $delegate(function() {
          queueCb.apply(context, Array.prototype.slice.call(queuedArgs));
          alreadyQueued = false;
        });
      }
    };
  };
  return $delegate;
}

/**
 * @ngInject
 */
function qDecorator($delegate) {
  /**
   * Adds a shim for $q.resolve for AngularJS version that don't have it,
   * so we don't have to think about it.
   *
   * via https://github.com/angular/angular.js/pull/11987
   */

  // TODO(crisbeto): this won't be necessary once we drop AngularJS 1.3
  if (!$delegate.resolve) {
    $delegate.resolve = $delegate.when;
  }
  return $delegate;
}

})(); 
(function(){
"use strict";

angular.module('material.core.js')
  .provider('$$interimElement', InterimElementProvider);

/*
 * @ngdoc service
 * @name $$interimElement
 * @module material.core
 *
 * @description
 *
 * Factory that constructs `$$interimElement.$service` services.
 * Used internally in material design for elements that appear on screen temporarily.
 * The service provides a promise-like API for interacting with the temporary
 * elements.
 *
 * ```js
 * app.service('$mdToast', function($$interimElement) {
 *   var $mdToast = $$interimElement(toastDefaultOptions);
 *   return $mdToast;
 * });
 * ```
 * @param {object=} defaultOptions Options used by default for the `show` method on the service.
 *
 * @returns {$$interimElement.$service}
 *
 */

function InterimElementProvider() {
  InterimElementFactory.$inject = ["$document", "$q", "$rootScope", "$timeout", "$rootElement", "$animate", "$mdUtil", "$mdCompiler", "$mdTheming", "$injector", "$exceptionHandler"];
  createInterimElementProvider.$get = InterimElementFactory;
  return createInterimElementProvider;

  /**
   * Returns a new provider which allows configuration of a new interimElement
   * service. Allows configuration of default options & methods for options,
   * as well as configuration of 'preset' methods (eg dialog.basic(): basic is a preset method)
   */
  function createInterimElementProvider(interimFactoryName) {
    factory.$inject = ["$$interimElement", "$injector"];
    const EXPOSED_METHODS = ['onHide', 'onShow', 'onRemove'];

    const customMethods = {};
    const providerConfig = {
      presets: {}
    };

    const provider = {
      setDefaults: setDefaults,
      addPreset: addPreset,
      addMethod: addMethod,
      $get: factory
    };

    /**
     * all interim elements will come with the 'build' preset
     */
    provider.addPreset('build', {
      methods: ['controller', 'controllerAs', 'resolve', 'multiple',
        'template', 'templateUrl', 'themable', 'transformTemplate', 'parent', 'contentElement']
    });

    return provider;

    /**
     * Save the configured defaults to be used when the factory is instantiated
     */
    function setDefaults(definition) {
      providerConfig.optionsFactory = definition.options;
      providerConfig.methods = (definition.methods || []).concat(EXPOSED_METHODS);
      return provider;
    }

    /**
     * Add a method to the factory that isn't specific to any interim element operations
     */

    function addMethod(name, fn) {
      customMethods[name] = fn;
      return provider;
    }

    /**
     * Save the configured preset to be used when the factory is instantiated
     */
    function addPreset(name, definition) {
      definition = definition || {};
      definition.methods = definition.methods || [];
      definition.options = definition.options || function() { return {}; };

      if (/^cancel|hide|show$/.test(name)) {
        throw new Error("Preset '" + name + "' in " + interimFactoryName + " is reserved!");
      }
      if (definition.methods.indexOf('_options') > -1) {
        throw new Error("Method '_options' in " + interimFactoryName + " is reserved!");
      }
      providerConfig.presets[name] = {
        methods: definition.methods.concat(EXPOSED_METHODS),
        optionsFactory: definition.options,
        argOption: definition.argOption
      };
      return provider;
    }

    function addPresetMethod(presetName, methodName, method) {
      providerConfig.presets[presetName][methodName] = method;
    }

    /**
     * Create a factory that has the given methods & defaults implementing interimElement
     */
    /* @ngInject */
    function factory($$interimElement, $injector) {
      console.log('ada');
      let defaultMethods;
      let defaultOptions;
      const interimElementService = $$interimElement();

      /*
       * publicService is what the developer will be using.
       * It has methods hide(), cancel(), show(), build(), and any other
       * presets which were set during the config phase.
       */
      const publicService = {
        hide: interimElementService.hide,
        cancel: interimElementService.cancel,
        show: showInterimElement,

        // Special internal method to destroy an interim element without animations
        // used when navigation changes causes a $scope.$destroy() action
        destroy : destroyInterimElement
      };


      defaultMethods = providerConfig.methods || [];
      // This must be invoked after the publicService is initialized
      defaultOptions = invokeFactory(providerConfig.optionsFactory, {});

      // Copy over the simple custom methods
      angular.forEach(customMethods, function(fn, name) {
        publicService[name] = fn;
      });

      angular.forEach(providerConfig.presets, function(definition, name) {
        const presetDefaults = invokeFactory(definition.optionsFactory, {});
        const presetMethods = (definition.methods || []).concat(defaultMethods);

        // Every interimElement built with a preset has a field called `$type`,
        // which matches the name of the preset.
        // Eg in preset 'confirm', options.$type === 'confirm'
        angular.extend(presetDefaults, { $type: name });

        // This creates a preset class which has setter methods for every
        // method given in the `.addPreset()` function, as well as every
        // method given in the `.setDefaults()` function.
        //
        // @example
        // .setDefaults({
        //   methods: ['hasBackdrop', 'clickOutsideToClose', 'escapeToClose', 'targetEvent'],
        //   options: dialogDefaultOptions
        // })
        // .addPreset('alert', {
        //   methods: ['title', 'ok'],
        //   options: alertDialogOptions
        // })
        //
        // Set values will be passed to the options when interimElement.show() is called.
        function Preset(opts) {
          this._options = angular.extend({}, presetDefaults, opts);
        }
        angular.forEach(presetMethods, function(name) {
          Preset.prototype[name] = function(value) {
            this._options[name] = value;
            return this;
          };
        });

        // Create shortcut method for one-linear methods
        if (definition.argOption) {
          const methodName = 'show' + name.charAt(0).toUpperCase() + name.slice(1);
          publicService[methodName] = function(arg) {
            const config = publicService[name](arg);
            return publicService.show(config);
          };
        }

        // eg $mdDialog.alert() will return a new alert preset
        publicService[name] = function(arg) {
          // If argOption is supplied, eg `argOption: 'content'`, then we assume
          // if the argument is not an options object then it is the `argOption` option.
          //
          // @example `$mdToast.simple('hello')` // sets options.content to hello
          //                                     // because argOption === 'content'
          if (arguments.length && definition.argOption &&
              !angular.isObject(arg) && !angular.isArray(arg))  {

            return (new Preset())[definition.argOption](arg);

          } else {
            return new Preset(arg);
          }

        };
      });

      return publicService;

      /**
       *
       */
      function showInterimElement(opts) {
        // opts is either a preset which stores its options on an _options field,
        // or just an object made up of options
        opts = opts || { };
        if (opts._options) opts = opts._options;

        return interimElementService.show(
          angular.extend({}, defaultOptions, opts)
        );
      }

      /**
       *  Special method to hide and destroy an interimElement WITHOUT
       *  any 'leave` or hide animations ( an immediate force hide/remove )
       *
       *  NOTE: This calls the onRemove() subclass method for each component...
       *  which must have code to respond to `options.$destroy == true`
       */
      function destroyInterimElement(opts) {
          return interimElementService.destroy(opts);
      }

      /**
       * Helper to call $injector.invoke with a local of the factory name for
       * this provider.
       * If an $mdDialog is providing options for a dialog and tries to inject
       * $mdDialog, a circular dependency error will happen.
       * We get around that by manually injecting $mdDialog as a local.
       */
      function invokeFactory(factory, defaultVal) {
        const locals = {};
        locals[interimFactoryName] = publicService;
        return $injector.invoke(factory || function() { return defaultVal; }, {}, locals);
      }

    }

  }

  /* @ngInject */
  function InterimElementFactory($document, $q, $rootScope, $timeout, $rootElement, $animate,
                                 $mdUtil, $mdCompiler, $mdTheming, $injector, $exceptionHandler) {
    return function createInterimElementService() {
      const SHOW_CANCELLED = false;

      /*
       * @ngdoc service
       * @name $$interimElement.$service
       *
       * @description
       * A service used to control inserting and removing an element into the DOM.
       *
       */

      let service;

      const showPromises = []; // Promises for the interim's which are currently opening.
      const hidePromises = []; // Promises for the interim's which are currently hiding.
      const showingInterims = []; // Interim elements which are currently showing up.

      // Publish instance $$interimElement service;
      // ... used as $mdDialog, $mdToast, $mdMenu, and $mdSelect

      return service = {
        show: show,
        hide: waitForInterim(hide),
        cancel: waitForInterim(cancel),
        destroy : destroy,
        $injector_: $injector
      };

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
      function show(options) {
        options = options || {};
        const interimElement = new InterimElement(options || {});

        // When an interim element is currently showing, we have to cancel it.
        // Just hiding it, will resolve the InterimElement's promise, the promise should be
        // rejected instead.
        let hideAction = options.multiple ? $q.resolve() : $q.all(showPromises);

        if (!options.multiple) {
          // Wait for all opening interim's to finish their transition.
          hideAction = hideAction.then(function() {
            // Wait for all closing and showing interim's to be completely closed.
            const promiseArray = hidePromises.concat(showingInterims.map(service.cancel));
            return $q.all(promiseArray);
          });
        }

        var showAction = hideAction.then(function() {

          return interimElement
            .show()
            .catch(function(reason) { return reason; })
            .finally(function() {
              showPromises.splice(showPromises.indexOf(showAction), 1);
              showingInterims.push(interimElement);
            });

        });

        showPromises.push(showAction);

        // In AngularJS 1.6+, exceptions inside promises will cause a rejection. We need to handle
        // the rejection and only log it if it's an error.
        interimElement.deferred.promise.catch(function(fault) {
          if (fault instanceof Error) {
            $exceptionHandler(fault);
          }

          return fault;
        });

        // Return a promise that will be resolved when the interim
        // element is hidden or cancelled...
        return interimElement.deferred.promise;
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
      function hide(reason, options) {
        options = options || {};

        if (options.closeAll) {
          // We have to make a shallow copy of the array, because otherwise the map will break.
          return $q.all(showingInterims.slice().reverse().map(closeElement));
        } else if (options.closeTo !== undefined) {
          return $q.all(showingInterims.slice(options.closeTo).map(closeElement));
        }

        // Hide the latest showing interim element.
        return closeElement(showingInterims[showingInterims.length - 1]);

        function closeElement(interim) {

          if (!interim) {
            return $q.when(reason);
          }

          var hideAction = interim
            .remove(reason, false, options || { })
            .catch(function(reason) { return reason; })
            .finally(function() {
              hidePromises.splice(hidePromises.indexOf(hideAction), 1);
            });

          showingInterims.splice(showingInterims.indexOf(interim), 1);
          hidePromises.push(hideAction);

          return interim.deferred.promise;
        }
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
      function cancel(reason, options) {
        const interim = showingInterims.pop();
        if (!interim) {
          return $q.when(reason);
        }

        var cancelAction = interim
          .remove(reason, true, options || {})
          .catch(function(reason) { return reason; })
          .finally(function() {
            hidePromises.splice(hidePromises.indexOf(cancelAction), 1);
          });

        hidePromises.push(cancelAction);

        // Since AngularJS 1.6.7, promises will be logged to $exceptionHandler when the promise
        // is not handling the rejection. We create a pseudo catch handler, which will prevent the
        // promise from being logged to the $exceptionHandler.
        return interim.deferred.promise.catch(angular.noop);
      }

      /**
       * Creates a function to wait for at least one interim element to be available.
       * @param callbackFn Function to be used as callback
       * @returns {Function}
       */
      function waitForInterim(callbackFn) {
        return function() {
          const fnArguments = arguments;

          if (!showingInterims.length) {
            // When there are still interim's opening, then wait for the first interim element to
            // finish its open animation.
            if (showPromises.length) {
              return showPromises[0].finally(function () {
                return callbackFn.apply(service, fnArguments);
              });
            }

            return $q.when("No interim elements currently showing up.");
          }

          return callbackFn.apply(service, fnArguments);
        };
      }

      /*
       * Special method to quick-remove the interim element without animations
       * Note: interim elements are in "interim containers"
       */
      function destroy(targetEl) {
        let interim = !targetEl ? showingInterims.shift() : null;

        const parentEl = angular.element(targetEl).length && angular.element(targetEl)[0].parentNode;

        if (parentEl) {
          // Try to find the interim in the stack which corresponds to the supplied DOM element.
          const filtered = showingInterims.filter(function(entry) {
            return entry.options.element[0] === parentEl;
          });

          // Note: This function might be called when the element already has been removed,
          // in which case we won't find any matches.
          if (filtered.length) {
            interim = filtered[0];
            showingInterims.splice(showingInterims.indexOf(interim), 1);
          }
        }

        return interim ? interim.remove(SHOW_CANCELLED, false, { '$destroy': true }) :
                         $q.when(SHOW_CANCELLED);
      }

      /*
       * Internal Interim Element Object
       * Used internally to manage the DOM element and related data
       */
      function InterimElement(options) {
        let self, element, showAction = $q.when(true);

        options = configureScopeAndTransitions(options);

        return self = {
          options : options,
          deferred: $q.defer(),
          show    : createAndTransitionIn,
          remove  : transitionOutAndRemove
        };

        /**
         * Compile, link, and show this interim element
         * Use optional autoHided and transition-in effects
         */
        function createAndTransitionIn() {
          return $q(function(resolve, reject) {

            // Trigger onCompiling callback before the compilation starts.
            // This is useful, when modifying options, which can be influenced by developers.
            options.onCompiling && options.onCompiling(options);

            compileElement(options)
              .then(function( compiledData ) {
                element = linkElement( compiledData, options );

                // Expose the cleanup function from the compiler.
                options.cleanupElement = compiledData.cleanup;

                showAction = showElement(element, options, compiledData.controller)
                  .then(resolve, rejectAll);
              }).catch(rejectAll);

            function rejectAll(fault) {
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
        function transitionOutAndRemove(response, isCancelled, opts) {

          // abort if the show() and compile failed
          if ( !element ) return $q.when(false);

          options = angular.extend(options || {}, opts || {});
          options.cancelAutoHide && options.cancelAutoHide();
          options.element.triggerHandler('$mdInterimElementRemove');

          if ( options.$destroy === true ) {

            return hideElement(options.element, options).then(function(){
              (isCancelled && rejectAll(response)) || resolveAll(response);
            });

          } else {
            $q.when(showAction).finally(function() {
              hideElement(options.element, options).then(function() {
                isCancelled ? rejectAll(response) : resolveAll(response);
              }, rejectAll);
            });

            return self.deferred.promise;
          }


          /**
           * The `show()` returns a promise that will be resolved when the interim
           * element is hidden or cancelled...
           */
          function resolveAll(response) {
            self.deferred.resolve(response);
          }

          /**
           * Force the '$md<xxx>.show()' promise to reject
           */
          function rejectAll(fault) {
            self.deferred.reject(fault);
          }
        }

        /**
         * Prepare optional isolated scope and prepare $animate with default enter and leave
         * transitions for the new element instance.
         */
        function configureScopeAndTransitions(options) {
          options = options || { };
          if ( options.template ) {
            options.template = $mdUtil.processTemplate(options.template);
          }

          return angular.extend({
            preserveScope: false,
            cancelAutoHide : angular.noop,
            scope: options.scope || $rootScope.$new(options.isolateScope),

            /**
             * Default usage to enable $animate to transition-in; can be easily overridden via 'options'
             */
            onShow: function transitionIn(scope, element, options) {
              return $animate.enter(element, options.parent);
            },

            /**
             * Default usage to enable $animate to transition-out; can be easily overridden via 'options'
             */
            onRemove: function transitionOut(scope, element) {
              // Element could be undefined if a new element is shown before
              // the old one finishes compiling.
              return element && $animate.leave(element) || $q.when();
            }
          }, options );

        }

        /**
         * Compile an element with a templateUrl, controller, and locals
         */
        function compileElement(options) {

          const compiled = !options.skipCompile ? $mdCompiler.compile(options) : null;

          return compiled || $q(function (resolve) {
              resolve({
                locals: {},
                link: function () {
                  return options.element;
                }
              });
            });
        }

        /**
         *  Link an element with compiled configuration
         */
        function linkElement(compileData, options){
          angular.extend(compileData.locals, options);

          const element = compileData.link(options.scope);

          // Search for parent at insertion time, if not specified
          options.element = element;
          options.parent = findParent(element, options);
          if (options.themable) $mdTheming(element);

          return element;
        }

        /**
         * Search for parent at insertion time, if not specified
         */
        function findParent(element, options) {
          let parent = options.parent;

          // Search for parent at insertion time, if not specified
          if (angular.isFunction(parent)) {
            parent = parent(options.scope, element, options);
          } else if (angular.isString(parent)) {
            parent = angular.element($document[0].querySelector(parent));
          } else {
            parent = angular.element(parent);
          }

          // If parent querySelector/getter function fails, or it's just null,
          // find a default.
          if (!(parent || {}).length) {
            let el;
            if ($rootElement[0] && $rootElement[0].querySelector) {
              el = $rootElement[0].querySelector(':not(svg) > body');
            }
            if (!el) el = $rootElement[0];
            if (el.nodeName == '#comment') {
              el = $document[0].body;
            }
            return angular.element(el);
          }

          return parent;
        }

        /**
         * If auto-hide is enabled, start timer and prepare cancel function
         */
        function startAutoHide() {
          let autoHideTimer, cancelAutoHide = angular.noop;

          if (options.hideDelay) {
            autoHideTimer = $timeout(service.hide, options.hideDelay) ;
            cancelAutoHide = function() {
              $timeout.cancel(autoHideTimer);
            };
          }

          // Cache for subsequent use
          options.cancelAutoHide = function() {
            cancelAutoHide();
            options.cancelAutoHide = undefined;
          };
        }

        /**
         * Show the element ( with transitions), notify complete and start
         * optional auto-Hide
         */
        function showElement(element, options, controller) {
          // Trigger onShowing callback before the `show()` starts
          const notifyShowing = options.onShowing || angular.noop;
          // Trigger onComplete callback when the `show()` finishes
          const notifyComplete = options.onComplete || angular.noop;

          // Necessary for consistency between AngularJS 1.5 and 1.6.
          try {
            notifyShowing(options.scope, element, options, controller);
          } catch (e) {
            return $q.reject(e);
          }

          return $q(function (resolve, reject) {
            try {
              // Start transitionIn
              $q.when(options.onShow(options.scope, element, options, controller))
                .then(function () {
                  notifyComplete(options.scope, element, options);
                  startAutoHide();

                  resolve(element);
                }, reject);

            } catch (e) {
              reject(e.message);
            }
          });
        }

        function hideElement(element, options) {
          const announceRemoving = options.onRemoving || angular.noop;

          return $q(function (resolve, reject) {
            try {
              // Start transitionIn
              const action = $q.when( options.onRemove(options.scope, element, options) || true );

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

      }
    };

  }

}

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.core.liveannouncer
 * @description
 * AngularJS Material Live Announcer to provide accessibility for Voice Readers.
 */
MdLiveAnnouncer.$inject = ["$timeout"];
angular
  .module('material.core.js')
  .service('$mdLiveAnnouncer', MdLiveAnnouncer);

/**
 * @ngdoc service
 * @name $mdLiveAnnouncer
 * @module material.core.liveannouncer
 *
 * @description
 *
 * Service to announce messages to supported screenreaders.
 *
 * > The `$mdLiveAnnouncer` service is internally used for components to provide proper accessibility.
 *
 * <hljs lang="js">
 *   module.controller('AppCtrl', function($mdLiveAnnouncer) {
 *     // Basic announcement (Polite Mode)
 *     $mdLiveAnnouncer.announce('Hey Google');
 *
 *     // Custom announcement (Assertive Mode)
 *     $mdLiveAnnouncer.announce('Hey Google', 'assertive');
 *   });
 * </hljs>
 *
 */
function MdLiveAnnouncer($timeout) {
  /** @private @const @type {!angular.$timeout} */
  this._$timeout = $timeout;

  /** @private @const @type {!HTMLElement} */
  this._liveElement = this._createLiveElement();

  /** @private @const @type {!number} */
  this._announceTimeout = 100;
}

/**
 * @ngdoc method
 * @name $mdLiveAnnouncer#announce
 * @description Announces messages to supported screenreaders.
 * @param {string} message Message to be announced to the screenreader
 * @param {'off'|'polite'|'assertive'} politeness The politeness of the announcer element.
 */
MdLiveAnnouncer.prototype.announce = function(message, politeness) {
  if (!politeness) {
    politeness = 'polite';
  }

  const self = this;

  self._liveElement.textContent = '';
  self._liveElement.setAttribute('aria-live', politeness);

  // This 100ms timeout is necessary for some browser + screen-reader combinations:
  // - Both JAWS and NVDA over IE11 will not announce anything without a non-zero timeout.
  // - With Chrome and IE11 with NVDA or JAWS, a repeated (identical) message won't be read a
  //   second time without clearing and then using a non-zero delay.
  // (using JAWS 17 at time of this writing).
  self._$timeout(function() {
    self._liveElement.textContent = message;
  }, self._announceTimeout, false);
};

/**
 * Creates a live announcer element, which listens for DOM changes and announces them
 * to the screenreaders.
 * @returns {!HTMLElement}
 * @private
 */
MdLiveAnnouncer.prototype._createLiveElement = function() {
  const liveEl = document.createElement('div');

  liveEl.classList.add('md-visually-hidden');
  liveEl.setAttribute('role', 'status');
  liveEl.setAttribute('aria-atomic', 'true');
  liveEl.setAttribute('aria-live', 'polite');

  document.body.appendChild(liveEl);

  return liveEl;
};

})();

(function(){
"use strict";

  /**
   * @ngdoc module
   * @name material.core.componentRegistry
   *
   * @description
   * A component instance registration service.
   * Note: currently this as a private service in the SideNav component.
   */
  ComponentRegistry.$inject = ["$log", "$q"];
  angular.module('material.core.js')
    .factory('$mdComponentRegistry', ComponentRegistry);

  /*
   * @private
   * @ngdoc factory
   * @name ComponentRegistry
   * @module material.core.componentRegistry
   *
   */
  function ComponentRegistry($log, $q) {

    let self;
    const instances = [ ];
    const pendings = { };

    return self = {
      /**
       * Used to print an error when an instance for a handle isn't found.
       */
      notFoundError: function(handle, msgContext) {
        $log.error( (msgContext || "") + 'No instance found for handle', handle);
      },
      /**
       * Return all registered instances as an array.
       */
      getInstances: function() {
        return instances;
      },

      /**
       * Get a registered instance.
       * @param handle the String handle to look up for a registered instance.
       */
      get: function(handle) {
        if ( !isValidID(handle) ) return null;

        let i, j, instance;
        for(i = 0, j = instances.length; i < j; i++) {
          instance = instances[i];
          if(instance.$$mdHandle === handle) {
            return instance;
          }
        }
        return null;
      },

      /**
       * Register an instance.
       * @param instance the instance to register
       * @param handle the handle to identify the instance under.
       */
      register: function(instance, handle) {
        if ( !handle ) return angular.noop;

        instance.$$mdHandle = handle;
        instances.push(instance);
        resolveWhen();

        return deregister;

        /**
         * Remove registration for an instance
         */
        function deregister() {
          const index = instances.indexOf(instance);
          if (index !== -1) {
            instances.splice(index, 1);
          }
        }

        /**
         * Resolve any pending promises for this instance
         */
        function resolveWhen() {
          const dfd = pendings[handle];
          if ( dfd ) {
            dfd.forEach(function (promise) {
              promise.resolve(instance);
            });
            delete pendings[handle];
          }
        }
      },

      /**
       * Async accessor to registered component instance
       * If not available then a promise is created to notify
       * all listeners when the instance is registered.
       */
      when : function(handle) {
        if ( isValidID(handle) ) {
          const deferred = $q.defer();
          const instance = self.get(handle);

          if ( instance )  {
            deferred.resolve( instance );
          } else {
            if (pendings[handle] === undefined) {
              pendings[handle] = [];
            }
            pendings[handle].push(deferred);
          }

          return deferred.promise;
        }
        return $q.reject("Invalid `md-component-id` value.");
      }

    };

    function isValidID(handle){
      return handle && (handle !== "");
    }

  }

})();

(function(){
"use strict";

(function() {
  'use strict';

    /**
   * @ngdoc service
   * @name $mdCheckboxInkRipple
   * @module material.core
   *
   * @description
   * Provides ripple effects for md-checkbox.  See $mdInkRipple service for all possible configuration options.
   *
   * @param {object=} scope Scope within the current context
   * @param {object=} element The element the ripple effect should be applied to
   * @param {object=} options (Optional) Configuration options to override the defaultripple configuration
   */

  MdCheckboxInkRipple.$inject = ["$mdInkRipple"];
  angular.module('material.core.js')
    .factory('$mdCheckboxInkRipple', MdCheckboxInkRipple);

  function MdCheckboxInkRipple($mdInkRipple) {
    return {
      attach: attach
    };

    function attach(scope, element, options) {
      return $mdInkRipple.attach(scope, element, angular.extend({
        center: true,
        dimBackground: false,
        fitRipple: true
      }, options));
    }
  }
})();

})();
(function(){
"use strict";

(function() {
  'use strict';

  /**
   * @ngdoc service
   * @name $mdListInkRipple
   * @module material.core
   *
   * @description
   * Provides ripple effects for md-list.  See $mdInkRipple service for all possible configuration options.
   *
   * @param {object=} scope Scope within the current context
   * @param {object=} element The element the ripple effect should be applied to
   * @param {object=} options (Optional) Configuration options to override the defaultripple configuration
   */

  MdListInkRipple.$inject = ["$mdInkRipple"];
  angular.module('material.core.js')
    .factory('$mdListInkRipple', MdListInkRipple);

  function MdListInkRipple($mdInkRipple) {
    return {
      attach: attach
    };

    function attach(scope, element, options) {
      return $mdInkRipple.attach(scope, element, angular.extend({
        center: false,
        dimBackground: true,
        outline: false,
        rippleSize: 'full'
      }, options));
    }
  }
})();

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.core.ripple
 * @description
 * Ripple
 */
InkRippleCtrl.$inject = ["$scope", "$element", "rippleOptions", "$window", "$timeout", "$mdUtil", "$mdColorUtil"];
InkRippleDirective.$inject = ["$mdButtonInkRipple", "$mdCheckboxInkRipple"];
angular.module('material.core.js')
    .provider('$$mdInkRipple', InkRippleProvider)
    .directive('mdInkRipple', InkRippleDirective)
    .directive('mdNoInk', attrNoDirective)
    .directive('mdNoBar', attrNoDirective)
    .directive('mdNoStretch', attrNoDirective);

const DURATION = 450;

/**
 * @ngdoc directive
 * @name mdInkRipple
 * @module material.core.ripple
 *
 * @description
 * The `md-ink-ripple` directive allows you to specify the ripple color or if a ripple is allowed.
 *
 * @param {string|boolean} md-ink-ripple A color string `#FF0000` or boolean (`false` or `0`) for preventing ripple
 *
 * @usage
 * ### String values
 * <hljs lang="html">
 *   <ANY md-ink-ripple="#FF0000">
 *     Ripples in red
 *   </ANY>
 *
 *   <ANY md-ink-ripple="false">
 *     Not rippling
 *   </ANY>
 * </hljs>
 *
 * ### Interpolated values
 * <hljs lang="html">
 *   <ANY md-ink-ripple="{{ randomColor() }}">
 *     Ripples with the return value of 'randomColor' function
 *   </ANY>
 *
 *   <ANY md-ink-ripple="{{ canRipple() }}">
 *     Ripples if 'canRipple' function return value is not 'false' or '0'
 *   </ANY>
 * </hljs>
 */
function InkRippleDirective ($mdButtonInkRipple, $mdCheckboxInkRipple) {
  return {
    controller: angular.noop,
    link:       function (scope, element, attr) {
      attr.hasOwnProperty('mdInkRippleCheckbox')
          ? $mdCheckboxInkRipple.attach(scope, element)
          : $mdButtonInkRipple.attach(scope, element);
    }
  };
}

/**
 * @ngdoc service
 * @name $mdInkRipple
 * @module material.core.ripple
 *
 * @description
 * `$mdInkRipple` is a service for adding ripples to any element
 *
 * @usage
 * <hljs lang="js">
 * app.factory('$myElementInkRipple', function($mdInkRipple) {
 *   return {
 *     attach: function (scope, element, options) {
 *       return $mdInkRipple.attach(scope, element, angular.extend({
 *         center: false,
 *         dimBackground: true
 *       }, options));
 *     }
 *   };
 * });
 *
 * app.controller('myController', function ($scope, $element, $myElementInkRipple) {
 *   $scope.onClick = function (ev) {
 *     $myElementInkRipple.attach($scope, angular.element(ev.target), { center: true });
 *   }
 * });
 * </hljs>
 *
 * ### Disabling ripples globally
 * If you want to disable ink ripples globally, for all components, you can call the
 * `disableInkRipple` method in your app's config.
 *
 * <hljs lang="js">
 * app.config(function ($mdInkRippleProvider) {
 *   $mdInkRippleProvider.disableInkRipple();
 * });
 */

function InkRippleProvider () {
  let isDisabledGlobally = false;

  return {
    disableInkRipple: disableInkRipple,
    $get: ["$injector", function($injector) {
      return { attach: attach };

      /**
       * @ngdoc method
       * @name $mdInkRipple#attach
       *
       * @description
       * Attaching given scope, element and options to inkRipple controller
       *
       * @param {object=} scope Scope within the current context
       * @param {object=} element The element the ripple effect should be applied to
       * @param {object=} options (Optional) Configuration options to override the defaultRipple configuration
       * * `center` -  Whether the ripple should start from the center of the container element
       * * `dimBackground` - Whether the background should be dimmed with the ripple color
       * * `colorElement` - The element the ripple should take its color from, defined by css property `color`
       * * `fitRipple` - Whether the ripple should fill the element
       */
      function attach (scope, element, options) {
        if (isDisabledGlobally || element.controller('mdNoInk')) return angular.noop;
        return $injector.instantiate(InkRippleCtrl, {
          $scope:        scope,
          $element:      element,
          rippleOptions: options
        });
      }
    }]
  };

  /**
   * @ngdoc method
   * @name $mdInkRipple#disableInkRipple
   *
   * @description
   * A config-time method that, when called, disables ripples globally.
   */
  function disableInkRipple () {
    isDisabledGlobally = true;
  }
}

/**
 * Controller used by the ripple service in order to apply ripples
 * @ngInject
 */
function InkRippleCtrl ($scope, $element, rippleOptions, $window, $timeout, $mdUtil, $mdColorUtil) {
  this.$window    = $window;
  this.$timeout   = $timeout;
  this.$mdUtil    = $mdUtil;
  this.$mdColorUtil    = $mdColorUtil;
  this.$scope     = $scope;
  this.$element   = $element;
  this.options    = rippleOptions;
  this.mousedown  = false;
  this.ripples    = [];
  this.timeout    = null; // Stores a reference to the most-recent ripple timeout
  this.lastRipple = null;
  $mdUtil.valueOnUse(this, 'container', this.createContainer);

  this.$element.addClass('md-ink-ripple');

  // attach method for unit tests
  ($element.controller('mdInkRipple') || {}).createRipple = angular.bind(this, this.createRipple);
  ($element.controller('mdInkRipple') || {}).setColor = angular.bind(this, this.color);

  this.bindEvents();
}


/**
 * Either remove or unlock any remaining ripples when the user mouses off of the element (either by
 * mouseup or mouseleave event)
 */
function autoCleanup (self, cleanupFn) {

  if ( self.mousedown || self.lastRipple ) {
    self.mousedown = false;
    self.$mdUtil.nextTick( angular.bind(self, cleanupFn), false);
  }

}


/**
 * Returns the color that the ripple should be (either based on CSS or hard-coded)
 * @returns {string}
 */
InkRippleCtrl.prototype.color = function (value) {
  const self = this;

  // If assigning a color value, apply it to background and the ripple color
  if (angular.isDefined(value)) {
    self._color = self._parseColor(value);
  }

  // If color lookup, use assigned, defined, or inherited
  return self._color || self._parseColor( self.inkRipple() ) || self._parseColor( getElementColor() );

  /**
   * Finds the color element and returns its text color for use as default ripple color
   * @returns {string}
   */
  function getElementColor () {
    const items = self.options && self.options.colorElement ? self.options.colorElement : [];
    const elem =  items.length ? items[ 0 ] : self.$element[ 0 ];

    return elem ? self.$window.getComputedStyle(elem).color : 'rgb(0,0,0)';
  }
};

/**
 * Updating the ripple colors based on the current inkRipple value
 * or the element's computed style color
 */
InkRippleCtrl.prototype.calculateColor = function () {
  return this.color();
};


/**
 * Takes a string color and converts it to RGBA format
 * @param color {string}
 * @param [multiplier] {int}
 * @returns {string}
 */

InkRippleCtrl.prototype._parseColor = function parseColor (color, multiplier) {
  multiplier = multiplier || 1;
  const colorUtil = this.$mdColorUtil;

  if (!color) return;
  if (color.indexOf('rgba') === 0) return color.replace(/\d?\.?\d*\s*\)\s*$/, (0.1 * multiplier).toString() + ')');
  if (color.indexOf('rgb') === 0) return colorUtil.rgbToRgba(color);
  if (color.indexOf('#') === 0) return colorUtil.hexToRgba(color);

};

/**
 * Binds events to the root element for
 */
InkRippleCtrl.prototype.bindEvents = function () {
  this.$element.on('mousedown', angular.bind(this, this.handleMousedown));
  this.$element.on('mouseup touchend', angular.bind(this, this.handleMouseup));
  this.$element.on('mouseleave', angular.bind(this, this.handleMouseup));
  this.$element.on('touchmove', angular.bind(this, this.handleTouchmove));
};

/**
 * Create a new ripple on every mousedown event from the root element
 * @param event {MouseEvent}
 */
InkRippleCtrl.prototype.handleMousedown = function (event) {
  if ( this.mousedown ) return;

  // When jQuery is loaded, we have to get the original event
  if (event.hasOwnProperty('originalEvent')) event = event.originalEvent;
  this.mousedown = true;
  if (this.options.center) {
    this.createRipple(this.container.prop('clientWidth') / 2, this.container.prop('clientWidth') / 2);
  } else {

    // We need to calculate the relative coordinates if the target is a sublayer of the ripple element
    if (event.srcElement !== this.$element[0]) {
      const layerRect = this.$element[0].getBoundingClientRect();
      const layerX = event.clientX - layerRect.left;
      const layerY = event.clientY - layerRect.top;

      this.createRipple(layerX, layerY);
    } else {
      this.createRipple(event.offsetX, event.offsetY);
    }
  }
};

/**
 * Either remove or unlock any remaining ripples when the user mouses off of the element (either by
 * mouseup, touchend or mouseleave event)
 */
InkRippleCtrl.prototype.handleMouseup = function () {
  this.$timeout(function () {
    autoCleanup(this, this.clearRipples);
  }.bind(this));
};

/**
 * Either remove or unlock any remaining ripples when the user mouses off of the element (by
 * touchmove)
 */
InkRippleCtrl.prototype.handleTouchmove = function () {
  autoCleanup(this, this.deleteRipples);
};

/**
 * Cycles through all ripples and attempts to remove them.
 */
InkRippleCtrl.prototype.deleteRipples = function () {
  for (let i = 0; i < this.ripples.length; i++) {
    this.ripples[ i ].remove();
  }
};

/**
 * Cycles through all ripples and attempts to remove them with fade.
 * Depending on logic within `fadeInComplete`, some removals will be postponed.
 */
InkRippleCtrl.prototype.clearRipples = function () {
  for (let i = 0; i < this.ripples.length; i++) {
    this.fadeInComplete(this.ripples[ i ]);
  }
};

/**
 * Creates the ripple container element
 * @returns {*}
 */
InkRippleCtrl.prototype.createContainer = function () {
  const container = angular.element('<div class="md-ripple-container"></div>');
  this.$element.append(container);
  return container;
};

InkRippleCtrl.prototype.clearTimeout = function () {
  if (this.timeout) {
    this.$timeout.cancel(this.timeout);
    this.timeout = null;
  }
};

InkRippleCtrl.prototype.isRippleAllowed = function () {
  let element = this.$element[0];
  do {
    if (!element.tagName || element.tagName === 'BODY') break;

    if (element && angular.isFunction(element.hasAttribute)) {
      if (element.hasAttribute('disabled')) return false;
      if (this.inkRipple() === 'false' || this.inkRipple() === '0') return false;
    }

  } while (element = element.parentNode);
  return true;
};

/**
 * The attribute `md-ink-ripple` may be a static or interpolated
 * color value OR a boolean indicator (used to disable ripples)
 */
InkRippleCtrl.prototype.inkRipple = function () {
  return this.$element.attr('md-ink-ripple');
};

/**
 * Creates a new ripple and adds it to the container.  Also tracks ripple in `this.ripples`.
 * @param left
 * @param top
 */
InkRippleCtrl.prototype.createRipple = function (left, top) {
  if (!this.isRippleAllowed()) return;

  const ctrl        = this;
  const colorUtil   = ctrl.$mdColorUtil;
  const ripple      = angular.element('<div class="md-ripple"></div>');
  const width       = this.$element.prop('clientWidth');
  const height      = this.$element.prop('clientHeight');
  const x           = Math.max(Math.abs(width - left), left) * 2;
  const y           = Math.max(Math.abs(height - top), top) * 2;
  const size        = getSize(this.options.fitRipple, x, y);
  const color       = this.calculateColor();

  ripple.css({
    left:            left + 'px',
    top:             top + 'px',
    background:      'black',
    width:           size + 'px',
    height:          size + 'px',
    backgroundColor: colorUtil.rgbaToRgb(color),
    borderColor:     colorUtil.rgbaToRgb(color)
  });
  this.lastRipple = ripple;

  // we only want one timeout to be running at a time
  this.clearTimeout();
  this.timeout    = this.$timeout(function () {
    ctrl.clearTimeout();
    if (!ctrl.mousedown) ctrl.fadeInComplete(ripple);
  }, DURATION * 0.35, false);

  if (this.options.dimBackground) this.container.css({ backgroundColor: color });
  this.container.append(ripple);
  this.ripples.push(ripple);
  ripple.addClass('md-ripple-placed');

  this.$mdUtil.nextTick(function () {

    ripple.addClass('md-ripple-scaled md-ripple-active');
    ctrl.$timeout(function () {
      ctrl.clearRipples();
    }, DURATION, false);

  }, false);

  function getSize (fit, x, y) {
    return fit
        ? Math.max(x, y)
        : Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  }
};



/**
 * After fadeIn finishes, either kicks off the fade-out animation or queues the element for removal on mouseup
 * @param ripple
 */
InkRippleCtrl.prototype.fadeInComplete = function (ripple) {
  if (this.lastRipple === ripple) {
    if (!this.timeout && !this.mousedown) {
      this.removeRipple(ripple);
    }
  } else {
    this.removeRipple(ripple);
  }
};

/**
 * Kicks off the animation for removing a ripple
 * @param ripple {Element}
 */
InkRippleCtrl.prototype.removeRipple = function (ripple) {
  const ctrl  = this;
  const index = this.ripples.indexOf(ripple);
  if (index < 0) return;
  this.ripples.splice(this.ripples.indexOf(ripple), 1);
  ripple.removeClass('md-ripple-active');
  ripple.addClass('md-ripple-remove');
  if (this.ripples.length === 0) this.container.css({ backgroundColor: '' });
  // use a 2-second timeout in order to allow for the animation to finish
  // we don't actually care how long the animation takes
  this.$timeout(function () {
    ctrl.fadeOutComplete(ripple);
  }, DURATION, false);
};

/**
 * Removes the provided ripple from the DOM
 * @param ripple
 */
InkRippleCtrl.prototype.fadeOutComplete = function (ripple) {
  ripple.remove();
  this.lastRipple = null;
};

/**
 * Used to create an empty directive.  This is used to track flag-directives whose children may have
 * functionality based on them.
 *
 * Example: `md-no-ink` will potentially be used by all child directives.
 */
function attrNoDirective () {
  return { controller: angular.noop };
}

})();
(function(){
"use strict";

(function() {
  'use strict';

    /**
   * @ngdoc service
   * @name $mdTabInkRipple
   * @module material.core
   *
   * @description
   * Provides ripple effects for md-tabs.  See $mdInkRipple service for all possible configuration options.
   *
   * @param {object=} scope Scope within the current context
   * @param {object=} element The element the ripple effect should be applied to
   * @param {object=} options (Optional) Configuration options to override the defaultripple configuration
   */

  MdTabInkRipple.$inject = ["$mdInkRipple"];
  angular.module('material.core.js')
    .factory('$mdTabInkRipple', MdTabInkRipple);

  function MdTabInkRipple($mdInkRipple) {
    return {
      attach: attach
    };

    function attach(scope, element, options) {
      return $mdInkRipple.attach(scope, element, angular.extend({
        center: false,
        dimBackground: true,
        outline: false,
        rippleSize: 'full'
      }, options));
    }
  }
})();

})();
/**(function(){
"use strict";

angular.module('material.core.theming.palette', [])
.constant('$mdColorPalette', {});

})();**/
(function(){
"use strict";

(function(angular) {
  'use strict';
/**
 * @ngdoc module
 * @name material.core.theming
 * @description
 * Theming
 */
detectDisabledThemes.$inject = ["$mdThemingProvider"];
ThemingDirective.$inject = ["$mdTheming", "$interpolate", "$parse", "$mdUtil", "$q", "$log"];
ThemableDirective.$inject = ["$mdTheming"];
ThemingProvider.$inject = ["$mdColorPalette", "$$mdMetaProvider"];
generateAllThemes.$inject = ["$injector", "$mdTheming"];
angular.module('material.core.theming', ['ng.material.core.theming.palette'])
  .directive('mdTheme', ThemingDirective)
  .directive('mdThemable', ThemableDirective)
  .directive('mdThemesDisabled', disableThemesDirective )
  .provider('$mdTheming', ThemingProvider)
  .config( detectDisabledThemes )
  .run(generateAllThemes);

/**
 * Detect if the HTML or the BODY tags has a [md-themes-disabled] attribute
 * If yes, then immediately disable all theme stylesheet generation and DOM injection
 */
/**
 * @ngInject
 */
function detectDisabledThemes($mdThemingProvider) {
  const isDisabled = !!document.querySelector('[md-themes-disabled]');
  $mdThemingProvider.disableTheming(isDisabled);
}

/**
 * @ngdoc service
 * @name $mdThemingProvider
 * @module material.core.theming
 *
 * @description Provider to configure the `$mdTheming` service.
 *
 * ### Default Theme
 * The `$mdThemingProvider` uses by default the following theme configuration:
 *
 * - Primary Palette: `Blue`
 * - Accent Palette: `Pink`
 * - Warn Palette: `Deep-Orange`
 * - Background Palette: `Grey`
 *
 * If you don't want to use the `md-theme` directive on the elements itself, you may want to overwrite
 * the default theme.<br/>
 * This can be done by using the following markup.
 *
 * <hljs lang="js">
 *   myAppModule.config(function($mdThemingProvider) {
 *     $mdThemingProvider
 *       .theme('default')
 *       .primaryPalette('blue')
 *       .accentPalette('teal')
 *       .warnPalette('red')
 *       .backgroundPalette('grey');
 *   });
 * </hljs>
 *

 * ### Dynamic Themes
 *
 * By default, if you change a theme at runtime, the `$mdTheming` service will not detect those changes.<br/>
 * If you have an application, which changes its theme on runtime, you have to enable theme watching.
 *
 * <hljs lang="js">
 *   myAppModule.config(function($mdThemingProvider) {
 *     // Enable theme watching.
 *     $mdThemingProvider.alwaysWatchTheme(true);
 *   });
 * </hljs>
 *
 * ### Custom Theme Styles
 *
 * Sometimes you may want to use your own theme styles for some custom components.<br/>
 * You are able to register your own styles by using the following markup.
 *
 * <hljs lang="js">
 *   myAppModule.config(function($mdThemingProvider) {
 *     // Register our custom stylesheet into the theming provider.
 *     $mdThemingProvider.registerStyles(STYLESHEET);
 *   });
 * </hljs>
 *
 * The `registerStyles` method only accepts strings as value, so you're actually not able to load an external
 * stylesheet file into the `$mdThemingProvider`.
 *
 * If it's necessary to load an external stylesheet, we suggest using a bundler, which supports including raw content,
 * like [raw-loader](https://github.com/webpack/raw-loader) for `webpack`.
 *
 * <hljs lang="js">
 *   myAppModule.config(function($mdThemingProvider) {
 *     // Register your custom stylesheet into the theming provider.
 *     $mdThemingProvider.registerStyles(require('../styles/my-component.theme.css'));
 *   });
 * </hljs>
 *
 * ### Browser color
 *
 * Enables browser header coloring
 * for more info please visit:
 * https://developers.google.com/web/fundamentals/design-and-ui/browser-customization/theme-color
 *
 * Options parameter: <br/>
 * `theme`   - A defined theme via `$mdThemeProvider` to use the palettes from. Default is `default` theme. <br/>
 * `palette` - Can be any one of the basic material design palettes, extended defined palettes and 'primary',
 *             'accent', 'background' and 'warn'. Default is `primary`. <br/>
 * `hue`     - The hue from the selected palette. Default is `800`<br/>
 *
 * <hljs lang="js">
 *   myAppModule.config(function($mdThemingProvider) {
 *     // Enable browser color
 *     $mdThemingProvider.enableBrowserColor({
 *       theme: 'myTheme', // Default is 'default'
 *       palette: 'accent', // Default is 'primary', any basic material palette and extended palettes are available
 *       hue: '200' // Default is '800'
 *     });
 *   });
 * </hljs>
 */

/**
 * Some Example Valid Theming Expressions
 * =======================================
 *
 * Intention group expansion: (valid for primary, accent, warn, background)
 *
 * {{primary-100}} - grab shade 100 from the primary palette
 * {{primary-100-0.7}} - grab shade 100, apply opacity of 0.7
 * {{primary-100-contrast}} - grab shade 100's contrast color
 * {{primary-hue-1}} - grab the shade assigned to hue-1 from the primary palette
 * {{primary-hue-1-0.7}} - apply 0.7 opacity to primary-hue-1
 * {{primary-color}} - Generates .md-hue-1, .md-hue-2, .md-hue-3 with configured shades set for each hue
 * {{primary-color-0.7}} - Apply 0.7 opacity to each of the above rules
 * {{primary-contrast}} - Generates .md-hue-1, .md-hue-2, .md-hue-3 with configured contrast (ie. text) color shades set for each hue
 * {{primary-contrast-0.7}} - Apply 0.7 opacity to each of the above rules
 *
 * Foreground expansion: Applies rgba to black/white foreground text
 *
 * {{foreground-1}} - used for primary text
 * {{foreground-2}} - used for secondary text/divider
 * {{foreground-3}} - used for disabled text
 * {{foreground-4}} - used for dividers
 */

// In memory generated CSS rules; registered by theme.name
const GENERATED = { };

// In memory storage of defined themes and color palettes (both loaded by CSS, and user specified)
let PALETTES;

// Text Colors on light and dark backgrounds
// @see https://material.io/archive/guidelines/style/color.html#color-usability
const DARK_FOREGROUND = {
  name: 'dark',
  '1': 'rgba(0,0,0,0.87)',
  '2': 'rgba(0,0,0,0.54)',
  '3': 'rgba(0,0,0,0.38)',
  '4': 'rgba(0,0,0,0.12)'
};
const LIGHT_FOREGROUND = {
  name: 'light',
  '1': 'rgba(255,255,255,1.0)',
  '2': 'rgba(255,255,255,0.7)',
  '3': 'rgba(255,255,255,0.5)',
  '4': 'rgba(255,255,255,0.12)'
};

const DARK_SHADOW = '1px 1px 0px rgba(0,0,0,0.4), -1px -1px 0px rgba(0,0,0,0.4)';
const LIGHT_SHADOW = '';

const DARK_CONTRAST_COLOR = colorToRgbaArray('rgba(0,0,0,0.87)');
const LIGHT_CONTRAST_COLOR = colorToRgbaArray('rgba(255,255,255,0.87)');
const STRONG_LIGHT_CONTRAST_COLOR = colorToRgbaArray('rgb(255,255,255)');

const THEME_COLOR_TYPES = ['primary', 'accent', 'warn', 'background'];
const DEFAULT_COLOR_TYPE = 'primary';

// A color in a theme will use these hues by default, if not specified by user.
const LIGHT_DEFAULT_HUES = {
  'accent': {
    'default': 'A200',
    'hue-1': 'A100',
    'hue-2': 'A400',
    'hue-3': 'A700'
  },
  'background': {
    'default': '50',
    'hue-1': 'A100',
    'hue-2': '100',
    'hue-3': '300'
  }
};

const DARK_DEFAULT_HUES = {
  'background': {
    'default': 'A400',
    'hue-1': '800',
    'hue-2': '900',
    'hue-3': 'A200'
  }
};
THEME_COLOR_TYPES.forEach(function(colorType) {
  // Color types with unspecified default hues will use these default hue values
  const defaultDefaultHues = {
    'default': '500',
    'hue-1': '300',
    'hue-2': '800',
    'hue-3': 'A100'
  };
  if (!LIGHT_DEFAULT_HUES[colorType]) LIGHT_DEFAULT_HUES[colorType] = defaultDefaultHues;
  if (!DARK_DEFAULT_HUES[colorType]) DARK_DEFAULT_HUES[colorType] = defaultDefaultHues;
});

const VALID_HUE_VALUES = [
  '50', '100', '200', '300', '400', '500', '600',
  '700', '800', '900', 'A100', 'A200', 'A400', 'A700'
];

const themeConfig = {
  disableTheming : false,   // Generate our themes at run time; also disable stylesheet DOM injection
  generateOnDemand : false, // Whether or not themes are to be generated on-demand (vs. eagerly).
  registeredStyles : [],    // Custom styles registered to be used in the theming of custom components.
  nonce : null              // Nonce to be added as an attribute to the generated themes style tags.
};

/**
 *
 */
function ThemingProvider($mdColorPalette, $$mdMetaProvider) {
  ThemingService.$inject = ["$rootScope", "$mdUtil", "$q", "$log"];
  PALETTES = { };
  const THEMES = { };

  let themingProvider;

  let alwaysWatchTheme = false;
  let defaultTheme = 'default';

  // Load JS Defined Palettes
  angular.extend(PALETTES, $mdColorPalette);

  // Default theme defined in core.js

  /**
   * Adds `theme-color` and `msapplication-navbutton-color` meta tags with the color parameter
   * @param {string} color Hex value of the wanted browser color
   * @returns {function} Remove function of the meta tags
   */
  const setBrowserColor = function (color) {
    // Chrome, Firefox OS and Opera
    const removeChrome = $$mdMetaProvider.setMeta('theme-color', color);
    // Windows Phone
    const removeWindows = $$mdMetaProvider.setMeta('msapplication-navbutton-color', color);

    return function () {
      removeChrome();
      removeWindows();
    };
  };

  /**
   * @ngdoc method
   * @name $mdThemingProvider#enableBrowserColor
   * @description
   * Enables browser header coloring. For more info please visit
   * <a href="https://developers.google.com/web/fundamentals/design-and-ui/browser-customization/theme-color">
   *   Web Fundamentals</a>.
   * @param {object=} options Options for the browser color, which include:<br/>
   * - `theme` - `{string}`: A defined theme via `$mdThemeProvider` to use the palettes from. Default is `default` theme. <br/>
   * - `palette` - `{string}`:  Can be any one of the basic material design palettes, extended defined palettes, or `primary`,
   *  `accent`, `background`, and `warn`. Default is `primary`.<br/>
   * - `hue` -  `{string}`: The hue from the selected palette. Default is `800`.<br/>
   * @returns {function} Function that removes the browser coloring when called.
   */
  const enableBrowserColor = function (options) {
    options = angular.isObject(options) ? options : {};

    const theme = options.theme || 'default';
    const hue = options.hue || '800';

    const palette = PALETTES[options.palette] ||
      PALETTES[THEMES[theme].colors[options.palette || 'primary'].name];

    let color = angular.isObject(palette[hue]) ? palette[hue].hex : palette[hue];
    if (color.substr(0, 1) !== '#') color = '#' + color;

    return setBrowserColor(color);
  };

  return themingProvider = {
    definePalette: definePalette,
    extendPalette: extendPalette,
    theme: registerTheme,

    /**
     * return a read-only clone of the current theme configuration
     */
    configuration : function() {
      return angular.extend( { }, themeConfig, {
        defaultTheme : defaultTheme,
        alwaysWatchTheme : alwaysWatchTheme,
        registeredStyles : [].concat(themeConfig.registeredStyles)
      });
    },

    /**
     * @ngdoc method
     * @name $mdThemingProvider#disableTheming
     * @description
     * An easier way to disable theming without having to use `.constant("$MD_THEME_CSS","");`.
     * This disables all dynamic theme style sheet generations and injections.
     * @param {boolean=} isDisabled Disable all dynamic theme style sheet generations and injections
     *  if `true` or `undefined`.
     */
    disableTheming: function(isDisabled) {
      themeConfig.disableTheming = angular.isUndefined(isDisabled) || !!isDisabled;
    },

    /**
     * @ngdoc method
     * @name $mdThemingProvider#registerStyles
     * @param {string} styles The styles to be appended to AngularJS Material's built in theme CSS.
     */
    registerStyles: function(styles) {
      themeConfig.registeredStyles.push(styles);
    },

    /**
     * @ngdoc method
     * @name $mdThemingProvider#setNonce
     * @param {string} nonceValue The nonce to be added as an attribute to the theme style tags.
     * Setting a value allows the use of CSP policy without using the unsafe-inline directive.
     */
    setNonce: function(nonceValue) {
      themeConfig.nonce = nonceValue;
    },

    generateThemesOnDemand: function(onDemand) {
      themeConfig.generateOnDemand = onDemand;
    },

    /**
     * @ngdoc method
     * @name $mdThemingProvider#setDefaultTheme
     * @param {string} theme Default theme name to be applied to elements. Default value is `default`.
     */
    setDefaultTheme: function(theme) {
      defaultTheme = theme;
    },

    /**
     * @ngdoc method
     * @name $mdThemingProvider#alwaysWatchTheme
     * @param {boolean} alwaysWatch Whether or not to always watch themes for changes and re-apply
     * classes when they change. Default is `false`. Enabling can reduce performance.
     */
    alwaysWatchTheme: function(alwaysWatch) {
      alwaysWatchTheme = alwaysWatch;
    },

    enableBrowserColor: enableBrowserColor,

    $get: ThemingService,
    _LIGHT_DEFAULT_HUES: LIGHT_DEFAULT_HUES,
    _DARK_DEFAULT_HUES: DARK_DEFAULT_HUES,
    _PALETTES: PALETTES,
    _THEMES: THEMES,
    _parseRules: parseRules,
    _rgba: rgba
  };

  /**
   * @ngdoc method
   * @name $mdThemingProvider#definePalette
   * @description
   * In the event that you need to define a custom color palette, you can use this function to
   * make it available to your theme for use in its intention groups.<br>
   * Note that you must specify all hues in the definition map.
   * @param {string} name Name of palette being defined
   * @param {object} map Palette definition that includes hue definitions and contrast colors:
   * - `'50'` - `{string}`: HEX color
   * - `'100'` - `{string}`: HEX color
   * - `'200'` - `{string}`: HEX color
   * - `'300'` - `{string}`: HEX color
   * - `'400'` - `{string}`: HEX color
   * - `'500'` - `{string}`: HEX color
   * - `'600'` - `{string}`: HEX color
   * - `'700'` - `{string}`: HEX color
   * - `'800'` - `{string}`: HEX color
   * - `'900'` - `{string}`: HEX color
   * - `'A100'` - `{string}`: HEX color
   * - `'A200'` - `{string}`: HEX color
   * - `'A400'` - `{string}`: HEX color
   * - `'A700'` - `{string}`: HEX color
   * - `'contrastDefaultColor'` - `{string}`: `light` or `dark`
   * - `'contrastDarkColors'` - `{string[]}`: Hues which should use dark contrast colors (i.e. raised button text).
   *  For example: `['50', '100', '200', '300', '400', 'A100']`.
   * - `'contrastLightColors'` - `{string[]}`: Hues which should use light contrast colors (i.e. raised button text).
   *  For example: `['500', '600', '700', '800', '900', 'A200', 'A400', 'A700']`.
   */
  function definePalette(name, map) {
    map = map || {};
    PALETTES[name] = checkPaletteValid(name, map);
    return themingProvider;
  }

  /**
   * @ngdoc method
   * @name $mdThemingProvider#extendPalette
   * @description
   * Sometimes it is easier to extend an existing color palette and then change a few properties,
   * rather than defining a whole new palette.
   * @param {string} name Name of palette being extended
   * @param {object} map Palette definition that includes optional hue definitions and contrast colors:
   * - `'50'` - `{string}`: HEX color
   * - `'100'` - `{string}`: HEX color
   * - `'200'` - `{string}`: HEX color
   * - `'300'` - `{string}`: HEX color
   * - `'400'` - `{string}`: HEX color
   * - `'500'` - `{string}`: HEX color
   * - `'600'` - `{string}`: HEX color
   * - `'700'` - `{string}`: HEX color
   * - `'800'` - `{string}`: HEX color
   * - `'900'` - `{string}`: HEX color
   * - `'A100'` - `{string}`: HEX color
   * - `'A200'` - `{string}`: HEX color
   * - `'A400'` - `{string}`: HEX color
   * - `'A700'` - `{string}`: HEX color
   * - `'contrastDefaultColor'` - `{string}`: `light` or `dark`
   * - `'contrastDarkColors'` - `{string[]}`: Hues which should use dark contrast colors (i.e. raised button text).
   *  For example: `['50', '100', '200', '300', '400', 'A100']`.
   * - `'contrastLightColors'` - `{string[]}`: Hues which should use light contrast colors (i.e. raised button text).
   *  For example: `['500', '600', '700', '800', '900', 'A200', 'A400', 'A700']`.
   *  @returns {object} A new object which is a copy of the given palette, `name`,
   *    with variables from `map` overwritten.
   */
  function extendPalette(name, map) {
    return checkPaletteValid(name,  angular.extend({}, PALETTES[name] || {}, map) );
  }

  // Make sure that palette has all required hues
  function checkPaletteValid(name, map) {
    const missingColors = VALID_HUE_VALUES.filter(function(field) {
      return !map[field];
    });
    if (missingColors.length) {
      throw new Error("Missing colors %1 in palette %2!"
                      .replace('%1', missingColors.join(', '))
                      .replace('%2', name));
    }

    return map;
  }

  /**
   * @ngdoc method
   * @name $mdThemingProvider#theme
   * @description
   * Register a theme (which is a collection of color palettes); i.e. `warn`, `accent`,
   * `background`, and `primary`.<br>
   * Optionally inherit from an existing theme.
   * @param {string} name Name of theme being registered
   * @param {string=} inheritFrom Existing theme name to inherit from
   */
  function registerTheme(name, inheritFrom) {
    if (THEMES[name]) return THEMES[name];

    inheritFrom = inheritFrom || 'default';

    const parentTheme = typeof inheritFrom === 'string' ? THEMES[inheritFrom] : inheritFrom;
    const theme = new Theme(name);

    if (parentTheme) {
      angular.forEach(parentTheme.colors, function(color, colorType) {
        theme.colors[colorType] = {
          name: color.name,
          // Make sure a COPY of the hues is given to the child color,
          // not the same reference.
          hues: angular.extend({}, color.hues)
        };
      });
    }
    THEMES[name] = theme;

    return theme;
  }

  function Theme(name) {
    const self = this;
    self.name = name;
    self.colors = {};

    self.dark = setDark;
    setDark(false);

    function setDark(isDark) {
      isDark = arguments.length === 0 ? true : !!isDark;

      // If no change, abort
      if (isDark === self.isDark) return;

      self.isDark = isDark;

      self.foregroundPalette = self.isDark ? LIGHT_FOREGROUND : DARK_FOREGROUND;
      self.foregroundShadow = self.isDark ? DARK_SHADOW : LIGHT_SHADOW;

      // Light and dark themes have different default hues.
      // Go through each existing color type for this theme, and for every
      // hue value that is still the default hue value from the previous light/dark setting,
      // set it to the default hue value from the new light/dark setting.
      const newDefaultHues = self.isDark ? DARK_DEFAULT_HUES : LIGHT_DEFAULT_HUES;
      const oldDefaultHues = self.isDark ? LIGHT_DEFAULT_HUES : DARK_DEFAULT_HUES;
      angular.forEach(newDefaultHues, function(newDefaults, colorType) {
        const color = self.colors[colorType];
        const oldDefaults = oldDefaultHues[colorType];
        if (color) {
          for (const hueName in color.hues) {
            if (color.hues[hueName] === oldDefaults[hueName]) {
              color.hues[hueName] = newDefaults[hueName];
            }
          }
        }
      });

      return self;
    }

    THEME_COLOR_TYPES.forEach(function(colorType) {
      const defaultHues = (self.isDark ? DARK_DEFAULT_HUES : LIGHT_DEFAULT_HUES)[colorType];
      self[colorType + 'Palette'] = function setPaletteType(paletteName, hues) {
        const color = self.colors[colorType] = {
          name: paletteName,
          hues: angular.extend({}, defaultHues, hues)
        };

        Object.keys(color.hues).forEach(function(name) {
          if (!defaultHues[name]) {
            throw new Error("Invalid hue name '%1' in theme %2's %3 color %4. Available hue names: %4"
              .replace('%1', name)
              .replace('%2', self.name)
              .replace('%3', paletteName)
              .replace('%4', Object.keys(defaultHues).join(', '))
            );
          }
        });
        Object.keys(color.hues).map(function(key) {
          return color.hues[key];
        }).forEach(function(hueValue) {
          if (VALID_HUE_VALUES.indexOf(hueValue) == -1) {
            throw new Error("Invalid hue value '%1' in theme %2's %3 color %4. Available hue values: %5"
              .replace('%1', hueValue)
              .replace('%2', self.name)
              .replace('%3', colorType)
              .replace('%4', paletteName)
              .replace('%5', VALID_HUE_VALUES.join(', '))
            );
          }
        });
        return self;
      };

      self[colorType + 'Color'] = function() {
        const args = Array.prototype.slice.call(arguments);
        // eslint-disable-next-line no-console
        console.warn('$mdThemingProviderTheme.' + colorType + 'Color() has been deprecated. ' +
                     'Use $mdThemingProviderTheme.' + colorType + 'Palette() instead.');
        return self[colorType + 'Palette'].apply(self, args);
      };
    });
  }

  /**
   * @ngdoc service
   * @name $mdTheming
   * @module material.core.theming
   * @description
   * Service that makes an element apply theming related <b>classes</b> to itself.
   *
   * For more information on the hue objects, their default values, as well as valid hue values, please visit <a ng-href="Theming/03_configuring_a_theme#specifying-custom-hues-for-color-intentions">the custom hues section of Configuring a Theme</a>.
   *
   * <hljs lang="js">
   * // Example component directive that we want to apply theming classes to.
   * app.directive('myFancyDirective', function($mdTheming) {
   *   return {
   *     restrict: 'AE',
   *     link: function(scope, element, attrs) {
   *       // Initialize the service using our directive's element
   *       $mdTheming(element);
   *
   *       $mdTheming.defineTheme('myTheme', {
   *         primary: 'blue',
   *         primaryHues: {
   *           default: '500',
   *           hue-1: '300',
   *           hue-2: '900',
   *           hue-3: 'A100'
   *         },
   *         accent: 'pink',
   *         accentHues: {
   *           default: '600',
   *           hue-1: '300',
   *           hue-2: '200',
   *           hue-3: 'A500'
   *         },
   *         warn: 'red',
   *         // It's not necessary to specify all hues in the object.
   *         warnHues: {
   *           default: '200',
   *           hue-3: 'A100'
   *         },
   *         // It's not necessary to specify custom hues at all.
   *         background: 'grey',
   *         dark: true
   *       });
   *       // Your directive's custom code here.
   *     }
   *   };
   * });
   * </hljs>
   * @param {element=} element Element that will have theming classes applied to it.
   */

  /**
   * @ngdoc property
   * @name $mdTheming#THEMES
   * @description
   * Property to get all the themes defined
   * @returns {object} All the themes defined with their properties.
   */

  /**
   * @ngdoc property
   * @name $mdTheming#PALETTES
   * @description
   * Property to get all the palettes defined
   * @returns {object} All the palettes defined with their colors.
   */

  /**
   * @ngdoc method
   * @name $mdTheming#registered
   * @description
   * Determine is specified theme name is a valid, registered theme
   * @param {string} themeName the theme to check if registered
   * @returns {boolean} whether the theme is registered or not
   */

  /**
   * @ngdoc method
   * @name $mdTheming#defaultTheme
   * @description
   * Returns the default theme
   * @returns {string} The default theme
   */

  /**
   * @ngdoc method
   * @name $mdTheming#generateTheme
   * @description
   * Lazy generate themes - by default, every theme is generated when defined.
   * You can disable this in the configuration section using the
   * `$mdThemingProvider.generateThemesOnDemand(true);`
   *
   * The theme name that is passed in must match the name of the theme that was defined as part of
   * the configuration block.
   *
   * @param {string} name theme name to generate
   */

  /**
   * @ngdoc method
   * @name $mdTheming#setBrowserColor
   * @description
   * Enables browser header coloring. For more info please visit
   * <a href="https://developers.google.com/web/fundamentals/design-and-ui/browser-customization/theme-color">
   *   Web Fundamentals</a>.
   * @param {object=} options Options for the browser color, which include:<br/>
   * - `theme` - `{string}`: A defined theme via `$mdThemeProvider` to use the palettes from.
   *    Default is `default` theme. <br/>
   * - `palette` - `{string}`:  Can be any one of the basic material design palettes, extended
   *    defined palettes, or `primary`, `accent`, `background`, and `warn`. Default is `primary`.
   * <br/>
   * - `hue` -  `{string}`: The hue from the selected palette. Default is `800`.<br/>
   * @returns {function} Function that removes the browser coloring when called.
   */

  /**
   * @ngdoc method
   * @name $mdTheming#defineTheme
   * @description
   * Dynamically define a theme by using an options object that contains palette names.
   *
   * @param {string} name Theme name to define
   * @param {object} options Theme definition options
   * Options are:<br/>
   * - `primary` - `{string}`: The name of the primary palette to use in the theme.<br/>
   * - `primaryHues` - `{object=}`: Override hues for primary palette.<br/>
   * - `accent` - `{string}`: The name of the accent palette to use in the theme.<br/>
   * - `accentHues` - `{object=}`: Override hues for accent palette.<br/>
   * - `warn` - `{string}`: The name of the warn palette to use in the theme.<br/>
   * - `warnHues` - `{object=}`: Override hues for warn palette.<br/>
   * - `background` - `{string}`: The name of the background palette to use in the theme.<br/>
   * - `backgroundHues` - `{object=}`: Override hues for background palette.<br/>
   * - `dark` - `{boolean}`: Indicates if it's a dark theme.<br/>
   * @returns {Promise<string>} A resolved promise with the new theme name.
   */

  /* @ngInject */
  function ThemingService($rootScope, $mdUtil, $q, $log) {
    // Allow us to be invoked via a linking function signature.
    var applyTheme = function (scope, el) {
      if (el === undefined) { el = scope; scope = undefined; }
      if (scope === undefined) { scope = $rootScope; }
      applyTheme.inherit(el, el);
    };

    Object.defineProperty(applyTheme, 'THEMES', {
      get: function () {
        return angular.extend({}, THEMES);
      }
    });
    Object.defineProperty(applyTheme, 'PALETTES', {
      get: function () {
        return angular.extend({}, PALETTES);
      }
    });
    Object.defineProperty(applyTheme, 'ALWAYS_WATCH', {
      get: function () {
        return alwaysWatchTheme;
      }
    });
    applyTheme.inherit = inheritTheme;
    applyTheme.registered = registered;
    applyTheme.defaultTheme = function() { return defaultTheme; };
    applyTheme.generateTheme = function(name) { generateTheme(THEMES[name], name, themeConfig.nonce); };
    applyTheme.defineTheme = function(name, options) {
      options = options || {};

      const theme = registerTheme(name);

      if (options.primary) {
        theme.primaryPalette(options.primary, options.primaryHues);
      }
      if (options.accent) {
        theme.accentPalette(options.accent, options.accentHues);
      }
      if (options.warn) {
        theme.warnPalette(options.warn, options.warnHues);
      }
      if (options.background) {
        theme.backgroundPalette(options.background, options.backgroundHues);
      }
      if (options.dark){
        theme.dark();
      }

      this.generateTheme(name);

      return $q.resolve(name);
    };
    applyTheme.setBrowserColor = enableBrowserColor;

    return applyTheme;

    /**
     * Determine is specified theme name is a valid, registered theme
     */
    function registered(themeName) {
      if (themeName === undefined || themeName === '') return true;
      return applyTheme.THEMES[themeName] !== undefined;
    }

    /**
     * Get theme name for the element, then update with Theme CSS class
     */
    function inheritTheme (el, parent) {
      const ctrl = parent.controller('mdTheme') || el.data('$mdThemeController');
      const scope = el.scope();

      updateThemeClass(lookupThemeName());

      if (ctrl) {
        const watchTheme = alwaysWatchTheme ||
                         ctrl.$shouldWatch ||
                         $mdUtil.parseAttributeBoolean(el.attr('md-theme-watch'));

        if (watchTheme || ctrl.isAsyncTheme) {
          const clearNameWatcher = function () {
            if (unwatch) {
              unwatch();
              unwatch = undefined;
            }
          };

          var unwatch = ctrl.registerChanges(function(name) {
            updateThemeClass(name);

            if (!watchTheme) {
              clearNameWatcher();
            }
          });

          if (scope) {
            scope.$on('$destroy', clearNameWatcher);
          } else {
            el.on('$destroy', clearNameWatcher);
          }
        }
      }

      /**
       * Find the theme name from the parent controller or element data
       */
      function lookupThemeName() {
        // As a few components (dialog) add their controllers later, we should also watch for a controller init.
        return ctrl && ctrl.$mdTheme || (defaultTheme === 'default' ? '' : defaultTheme);
      }

      /**
       * Remove old theme class and apply a new one
       * NOTE: if not a valid theme name, then the current name is not changed
       */
      function updateThemeClass(theme) {
        if (!theme) return;
        if (!registered(theme)) {
          $log.warn('Attempted to use unregistered theme \'' + theme + '\'. ' +
                    'Register it with $mdThemingProvider.theme().');
        }

        const oldTheme = el.data('$mdThemeName');
        if (oldTheme) el.removeClass('md-' + oldTheme +'-theme');
        el.addClass('md-' + theme + '-theme');
        el.data('$mdThemeName', theme);
        if (ctrl) {
          el.data('$mdThemeController', ctrl);
        }
      }
    }

  }
}

function ThemingDirective($mdTheming, $interpolate, $parse, $mdUtil, $q, $log) {
  return {
    priority: 101, // has to be more than 100 to be before interpolation (issue on IE)
    link: {
      pre: function(scope, el, attrs) {
        const registeredCallbacks = [];

        const startSymbol = $interpolate.startSymbol();
        const endSymbol = $interpolate.endSymbol();

        const theme = attrs.mdTheme.trim();

        const hasInterpolation =
          theme.substr(0, startSymbol.length) === startSymbol &&
          theme.lastIndexOf(endSymbol) === theme.length - endSymbol.length;

        const oneTimeOperator = '::';
        const oneTimeBind = attrs.mdTheme
            .split(startSymbol).join('')
            .split(endSymbol).join('')
            .trim()
            .substr(0, oneTimeOperator.length) === oneTimeOperator;

        const getTheme = function () {
          const interpolation = $interpolate(attrs.mdTheme)(scope);
          return $parse(interpolation)(scope) || interpolation;
        };

        var ctrl = {
          isAsyncTheme: angular.isFunction(getTheme()) || angular.isFunction(getTheme().then),
          registerChanges: function (cb, context) {
            if (context) {
              cb = angular.bind(context, cb);
            }

            registeredCallbacks.push(cb);

            return function () {
              const index = registeredCallbacks.indexOf(cb);

              if (index > -1) {
                registeredCallbacks.splice(index, 1);
              }
            };
          },
          $setTheme: function (theme) {
            if (!$mdTheming.registered(theme)) {
              $log.warn('attempted to use unregistered theme \'' + theme + '\'');
            }

            ctrl.$mdTheme = theme;

            // Iterating backwards to support unregistering during iteration
            // http://stackoverflow.com/a/9882349/890293
            // we don't use `reverse()` of array because it mutates the array and we don't want it
            // to get re-indexed
            for (let i = registeredCallbacks.length; i--;) {
              registeredCallbacks[i](theme);
            }
          },
          $shouldWatch: $mdUtil.parseAttributeBoolean(el.attr('md-theme-watch')) ||
                        $mdTheming.ALWAYS_WATCH ||
                        (hasInterpolation && !oneTimeBind)
        };

        el.data('$mdThemeController', ctrl);

        const setParsedTheme = function (theme) {
          if (typeof theme === 'string') {
            return ctrl.$setTheme(theme);
          }

          $q.when( angular.isFunction(theme) ?  theme() : theme )
            .then(function(name) {
              ctrl.$setTheme(name);
            });
        };

        setParsedTheme(getTheme());

        var unwatch = scope.$watch(getTheme, function(theme) {
          if (theme) {
            setParsedTheme(theme);

            if (!ctrl.$shouldWatch) {
              unwatch();
            }
          }
        });
      }
    }
  };
}

/**
 * Special directive that will disable ALL runtime Theme style generation and DOM injection
 *
 * <link rel="stylesheet" href="angular-material.min.css">
 * <link rel="stylesheet" href="angular-material.themes.css">
 *
 * <body md-themes-disabled>
 *  ...
 * </body>
 *
 * Note: Using md-themes-css directive requires the developer to load external
 * theme stylesheets; e.g. custom themes from Material-Tools:
 *
 *       `angular-material.themes.css`
 *
 * Another option is to use the ThemingProvider to configure and disable the attribute
 * conversions; this would obviate the use of the `md-themes-css` directive
 *
 */
function disableThemesDirective() {
  themeConfig.disableTheming = true;

  // Return a 1x-only, first-match attribute directive
  return {
    restrict : 'A',
    priority : '900'
  };
}

function ThemableDirective($mdTheming) {
  return $mdTheming;
}

function parseRules(theme, colorType, rules) {
  checkValidPalette(theme, colorType);

  rules = rules.replace(/THEME_NAME/g, theme.name);
  const themeNameRegex = new RegExp('\\.md-' + theme.name + '-theme', 'g');
  const simpleVariableRegex = /'?"?\{\{\s*([a-zA-Z]+)-(A?\d+|hue-[0-3]|shadow|default)-?(\d\.?\d*)?(contrast)?\s*\}\}'?"?/g;

  // find and replace simple variables where we use a specific hue, not an entire palette
  // eg. "{{primary-100}}"
  //\(' + THEME_COLOR_TYPES.join('\|') + '\)'
  rules = rules.replace(simpleVariableRegex, function(match, colorType, hue, opacity, contrast) {
    if (colorType === 'foreground') {
      if (hue == 'shadow') {
        return theme.foregroundShadow;
      } else {
        return theme.foregroundPalette[hue] || theme.foregroundPalette['1'];
      }
    }

    // `default` is also accepted as a hue-value, because the background palettes are
    // using it as a name for the default hue.
    if (hue.indexOf('hue') === 0 || hue === 'default') {
      hue = theme.colors[colorType].hues[hue];
    }

    return rgba( (PALETTES[ theme.colors[colorType].name ][hue] || '')[contrast ? 'contrast' : 'value'], opacity );
  });

  // Matches '{{ primary-color }}', etc
  const hueRegex = new RegExp('(\'|")?{{\\s*([a-zA-Z]+)-(color|contrast)-?(\\d\\.?\\d*)?\\s*}}("|\')?','g');
  const generatedRules = [];

  // For each type, generate rules for each hue (ie. default, md-hue-1, md-hue-2, md-hue-3)
  angular.forEach(['default', 'hue-1', 'hue-2', 'hue-3'], function(hueName) {
    let newRule = rules
      .replace(hueRegex, function(match, _, matchedColorType, hueType, opacity) {
        const color = theme.colors[matchedColorType];
        const palette = PALETTES[color.name];
        const hueValue = color.hues[hueName];
        return rgba(palette[hueValue][hueType === 'color' ? 'value' : 'contrast'], opacity);
      });
    if (hueName !== 'default') {
      newRule = newRule.replace(themeNameRegex, '.md-' + theme.name + '-theme.md-' + hueName);
    }

    // Don't apply a selector rule to the default theme, making it easier to override
    // styles of the base-component
    if (theme.name == 'default') {
      const themeRuleRegex = /((?:\s|>|\.|\w|-|:|\(|\)|\[|\]|"|'|=)*)\.md-default-theme((?:\s|>|\.|\w|-|:|\(|\)|\[|\]|"|'|=)*)/g;

      newRule = newRule.replace(themeRuleRegex, function(match, start, end) {
        return match + ', ' + start + end;
      });
    }
    generatedRules.push(newRule);
  });

  return generatedRules;
}

const rulesByType = {};

// Generate our themes at run time given the state of THEMES and PALETTES
function generateAllThemes($injector, $mdTheming) {
  const head = document.head;
  const firstChild = head ? head.firstElementChild : null;
  let themeCss = !themeConfig.disableTheming && $injector.has('$MD_THEME_CSS') ? $injector.get('$MD_THEME_CSS') : '';

  // Append our custom registered styles to the theme stylesheet.
  themeCss += themeConfig.registeredStyles.join('');

  if ( !firstChild ) return;
  if (themeCss.length === 0) return; // no rules, so no point in running this expensive task

  // Expose contrast colors for palettes to ensure that text is always readable
  angular.forEach(PALETTES, sanitizePalette);

  // MD_THEME_CSS is a string generated by the build process that includes all the themable
  // components as templates

  // Break the CSS into individual rules
  const rules = themeCss
                  .split(/\}(?!(\}|'|"|;))/)
                  .filter(function(rule) { return rule && rule.trim().length; })
                  .map(function(rule) { return rule.trim() + '}'; });

  THEME_COLOR_TYPES.forEach(function(type) {
    rulesByType[type] = '';
  });

  // Sort the rules based on type, allowing us to do color substitution on a per-type basis
  rules.forEach(function(rule) {
    // First: test that if the rule has '.md-accent', it goes into the accent set of rules
    for (var i = 0, type; type = THEME_COLOR_TYPES[i]; i++) {
      if (rule.indexOf('.md-' + type) > -1) {
        return rulesByType[type] += rule;
      }
    }

    // If no eg 'md-accent' class is found, try to just find 'accent' in the rule and guess from
    // there
    for (i = 0; type = THEME_COLOR_TYPES[i]; i++) {
      if (rule.indexOf(type) > -1) {
        return rulesByType[type] += rule;
      }
    }

    // Default to the primary array
    return rulesByType[DEFAULT_COLOR_TYPE] += rule;
  });

  // If themes are being generated on-demand, quit here. The user will later manually
  // call generateTheme to do this on a theme-by-theme basis.
  if (themeConfig.generateOnDemand) return;

  angular.forEach($mdTheming.THEMES, function(theme) {
    if (!GENERATED[theme.name] && !($mdTheming.defaultTheme() !== 'default' && theme.name === 'default')) {
      generateTheme(theme, theme.name, themeConfig.nonce);
    }
  });


  // *************************
  // Internal functions
  // *************************

  // The user specifies a 'default' contrast color as either light or dark,
  // then explicitly lists which hues are the opposite contrast (eg. A100 has dark, A200 has light)
  function sanitizePalette(palette, name) {
    const defaultContrast = palette.contrastDefaultColor;
    let lightColors = palette.contrastLightColors || [];
    let strongLightColors = palette.contrastStrongLightColors || [];
    let darkColors = palette.contrastDarkColors || [];

    // These colors are provided as space-separated lists
    if (typeof lightColors === 'string') lightColors = lightColors.split(' ');
    if (typeof strongLightColors === 'string') strongLightColors = strongLightColors.split(' ');
    if (typeof darkColors === 'string') darkColors = darkColors.split(' ');

    // Cleanup after ourselves
    delete palette.contrastDefaultColor;
    delete palette.contrastLightColors;
    delete palette.contrastStrongLightColors;
    delete palette.contrastDarkColors;

    // Change { 'A100': '#fffeee' } to { 'A100': { value: '#fffeee', contrast:DARK_CONTRAST_COLOR }
    angular.forEach(palette, function(hueValue, hueName) {
      if (angular.isObject(hueValue)) return; // Already converted
      // Map everything to rgb colors
      const rgbValue = colorToRgbaArray(hueValue);
      if (!rgbValue) {
        throw new Error("Color %1, in palette %2's hue %3, is invalid. Hex or rgb(a) color expected."
                        .replace('%1', hueValue)
                        .replace('%2', palette.name)
                        .replace('%3', hueName));
      }

      palette[hueName] = {
        hex: palette[hueName],
        value: rgbValue,
        contrast: getContrastColor()
      };
      function getContrastColor() {
        if (defaultContrast === 'light') {
          if (darkColors.indexOf(hueName) > -1) {
            return DARK_CONTRAST_COLOR;
          } else {
            return strongLightColors.indexOf(hueName) > -1 ? STRONG_LIGHT_CONTRAST_COLOR
              : LIGHT_CONTRAST_COLOR;
          }
        } else {
          if (lightColors.indexOf(hueName) > -1) {
            return strongLightColors.indexOf(hueName) > -1 ? STRONG_LIGHT_CONTRAST_COLOR
              : LIGHT_CONTRAST_COLOR;
          } else {
            return DARK_CONTRAST_COLOR;
          }
        }
      }
    });
  }
}

function generateTheme(theme, name, nonce) {
  const head = document.head;
  const firstChild = head ? head.firstElementChild : null;

  if (!GENERATED[name]) {
    // For each theme, use the color palettes specified for
    // `primary`, `warn` and `accent` to generate CSS rules.
    THEME_COLOR_TYPES.forEach(function(colorType) {
      const styleStrings = parseRules(theme, colorType, rulesByType[colorType]);
      while (styleStrings.length) {
        const styleContent = styleStrings.shift();
        if (styleContent) {
          const style = document.createElement('style');
          style.setAttribute('md-theme-style', '');
          if (nonce) {
            style.setAttribute('nonce', nonce);
          }
          style.appendChild(document.createTextNode(styleContent));
          head.insertBefore(style, firstChild);
        }
      }
    });

    GENERATED[theme.name] = true;
  }

}


function checkValidPalette(theme, colorType) {
  // If theme attempts to use a palette that doesnt exist, throw error
  if (!PALETTES[ (theme.colors[colorType] || {}).name ]) {
    throw new Error(
      "You supplied an invalid color palette for theme %1's %2 palette. Available palettes: %3"
                    .replace('%1', theme.name)
                    .replace('%2', colorType)
                    .replace('%3', Object.keys(PALETTES).join(', '))
    );
  }
}

function colorToRgbaArray(clr) {
  if (angular.isArray(clr) && clr.length == 3) return clr;
  if (/^rgb/.test(clr)) {
    return clr.replace(/(^\s*rgba?\(|\)\s*$)/g, '').split(',').map(function(value, i) {
      return i == 3 ? parseFloat(value, 10) : parseInt(value, 10);
    });
  }
  if (clr.charAt(0) == '#') clr = clr.substring(1);
  if (!/^([a-fA-F0-9]{3}){1,2}$/g.test(clr)) return;

  const dig = clr.length / 3;
  let red = clr.substr(0, dig);
  let grn = clr.substr(dig, dig);
  let blu = clr.substr(dig * 2);
  if (dig === 1) {
    red += red;
    grn += grn;
    blu += blu;
  }
  return [parseInt(red, 16), parseInt(grn, 16), parseInt(blu, 16)];
}

function rgba(rgbArray, opacity) {
  if ( !rgbArray ) return "rgb('0,0,0')";

  if (rgbArray.length == 4) {
    rgbArray = angular.copy(rgbArray);
    opacity ? rgbArray.pop() : opacity = rgbArray.pop();
  }
  return opacity && (typeof opacity == 'number' || (typeof opacity == 'string' && opacity.length)) ?
    'rgba(' + rgbArray.join(',') + ',' + opacity + ')' :
    'rgb(' + rgbArray.join(',') + ')';
}


})(window.angular);

})();

})(window, window.angular);;//window.ngMaterial={version:{full: "1.1.10"}};