angular
  .module('material.components.icon',['ng.material.core'])
  .constant('$$mdSvgRegistry', {
    'mdTabsArrow':   'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnPjxwb2x5Z29uIHBvaW50cz0iMTUuNCw3LjQgMTQsNiA4LDEyIDE0LDE4IDE1LjQsMTYuNiAxMC44LDEyICIvPjwvZz48L3N2Zz4=',
    'mdClose':       'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnPjxwYXRoIGQ9Ik0xOSA2LjQxbC0xLjQxLTEuNDEtNS41OSA1LjU5LTUuNTktNS41OS0xLjQxIDEuNDEgNS41OSA1LjU5LTUuNTkgNS41OSAxLjQxIDEuNDEgNS41OS01LjU5IDUuNTkgNS41OSAxLjQxLTEuNDEtNS41OS01LjU5eiIvPjwvZz48L3N2Zz4=',
    'mdCancel':      'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnPjxwYXRoIGQ9Ik0xMiAyYy01LjUzIDAtMTAgNC40Ny0xMCAxMHM0LjQ3IDEwIDEwIDEwIDEwLTQuNDcgMTAtMTAtNC40Ny0xMC0xMC0xMHptNSAxMy41OWwtMS40MSAxLjQxLTMuNTktMy41OS0zLjU5IDMuNTktMS40MS0xLjQxIDMuNTktMy41OS0zLjU5LTMuNTkgMS40MS0xLjQxIDMuNTkgMy41OSAzLjU5LTMuNTkgMS40MSAxLjQxLTMuNTkgMy41OSAzLjU5IDMuNTl6Ii8+PC9nPjwvc3ZnPg==',
    'mdMenu':        'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGQ9Ik0zLDZIMjFWOEgzVjZNMywxMUgyMVYxM0gzVjExTTMsMTZIMjFWMThIM1YxNloiIC8+PC9zdmc+',
    'mdToggleArrow': 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNDggNDgiPjxwYXRoIGQ9Ik0yNCAxNmwtMTIgMTIgMi44MyAyLjgzIDkuMTctOS4xNyA5LjE3IDkuMTcgMi44My0yLjgzeiIvPjxwYXRoIGQ9Ik0wIDBoNDh2NDhoLTQ4eiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==',
    'mdCalendar':    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTkgM2gtMVYxaC0ydjJIOFYxSDZ2Mkg1Yy0xLjExIDAtMS45OS45LTEuOTkgMkwzIDE5YzAgMS4xLjg5IDIgMiAyaDE0YzEuMSAwIDItLjkgMi0yVjVjMC0xLjEtLjktMi0yLTJ6bTAgMTZINVY4aDE0djExek03IDEwaDV2NUg3eiIvPjwvc3ZnPg==',
    'mdChecked':     'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnPjxwYXRoIGQ9Ik05IDE2LjE3TDQuODMgMTJsLTEuNDIgMS40MUw5IDE5IDIxIDdsLTEuNDEtMS40MXoiLz48L2c+PC9zdmc+'
})
  .provider('$mdIcon', MdIconProvider)
  .directive('mdIcon', ['$mdIcon', '$mdTheming', '$mdAria', '$sce', mdIconDirective]);

  const config = {
    defaultViewBoxSize: 24,
    defaultFontSet: 'fa',
    fontSets: []
  };
  
  function MdIconProvider() {
  }
  
  MdIconProvider.prototype = {
    icon: function(id, url, viewBoxSize) {
      if (id.indexOf(':') == -1) id = '$default:' + id;
  
      config[id] = new ConfigurationItem(url, viewBoxSize);
      return this;
    },
  
    iconSet: function(id, url, viewBoxSize) {
      config[id] = new ConfigurationItem(url, viewBoxSize);
      return this;
    },
  
    defaultIconSet: function(url, viewBoxSize) {
      const setName = '$default';
  
      if (!config[setName]) {
        config[setName] = new ConfigurationItem(url, viewBoxSize);
      }
  
      config[setName].viewBoxSize = viewBoxSize || config.defaultViewBoxSize;
  
      return this;
    },
  
    defaultViewBoxSize: function(viewBoxSize) {
      config.defaultViewBoxSize = viewBoxSize;
      return this;
    },
  
    /**
     * Register an alias name associated with a font-icon library style ;
     */
    fontSet: function fontSet(alias, className) {
      config.fontSets.push({
        alias: alias,
        fontSet: className || alias
      });
      return this;
    },
  
    /**
     * Specify a default style name associated with a font-icon library
     * fallback to Material Icons.
     *
     */ 
    defaultFontSet: function defaultFontSet(className) {
      config.defaultFontSet = !className ? '' : className;
      return this;
    },
  
    defaultIconSize: function defaultIconSize(iconSize) {
      config.defaultIconSize = iconSize;
      return this;
    },
  
    $get: ['$templateRequest', '$q', '$log', '$mdUtil', '$sce', function($templateRequest, $q, $log, $mdUtil, $sce) {
      return MdIconService(config, $templateRequest, $q, $log, $mdUtil, $sce);
    }]
  };
  
    /**
     * Configuration item stored in the Icon registry; used for lookups
     * to load if not already cached in the `loaded` cache
     * @param url
     * @param viewBoxSize
     * @constructor
     */
    function ConfigurationItem(url, viewBoxSize) {
    this.url = url;
    this.viewBoxSize = viewBoxSize || config.defaultViewBoxSize;
  }
  
  /**
   * @ngdoc service
   * @name $mdIcon
   * @module material.components.icon
   *
   * @description
   * The `$mdIcon` service is a function used to lookup SVG icons.
   *
   * @param {string} id Query value for a unique Id or URL. If the argument is a URL, then the service will retrieve the icon element
   * from its internal cache or load the icon and cache it first. If the value is not a URL-type string, then an ID lookup is
   * performed. The Id may be a unique icon ID or may include an iconSet ID prefix.
   *
   * For the **id** query to work properly, this means that all id-to-URL mappings must have been previously configured
   * using the `$mdIconProvider`.
   *
   * @returns {angular.$q.Promise} A promise that gets resolved to a clone of the initial SVG DOM element; which was
   * created from the SVG markup in the SVG data file. If an error occurs (e.g. the icon cannot be found) the promise
   * will get rejected.
   *
   * @usage
   * <hljs lang="js">
   * function SomeDirective($mdIcon) {
    *
    *   // See if the icon has already been loaded, if not
    *   // then lookup the icon from the registry cache, load and cache
    *   // it for future requests.
    *   // NOTE: ID queries require configuration with $mdIconProvider
    *
    *   $mdIcon('android').then(function(iconEl)    { element.append(iconEl); });
    *   $mdIcon('work:chair').then(function(iconEl) { element.append(iconEl); });
    *
    *   // Load and cache the external SVG using a URL
    *
    *   $mdIcon('img/icons/android.svg').then(function(iconEl) {
    *     element.append(iconEl);
    *   });
    * };
   * </hljs>
   *
   * > <b>Note:</b> The `<md-icon>` directive internally uses the `$mdIcon` service to query, load,
   *   and instantiate SVG DOM elements.
   */
  
  /* @ngInject */
  function MdIconService(config, $templateRequest, $q, $log, $mdUtil, $sce) {
    const iconCache = {};
    const svgCache = {};
    const urlRegex = /[-\w@:%+.~#?&//=]{2,}\.[a-z]{2,4}\b(\/[-\w@:%+.~#?&//=]*)?/i;
    const dataUrlRegex = /^data:image\/svg\+xml[\s*;\w\-=]*?(base64)?,(.*)$/i;
  
    Icon.prototype = {clone: cloneSVG, prepare: prepareAndStyle};
    getIcon.fontSet = findRegisteredFontSet;
  
    // Publish service...
    return getIcon;
  
    /**
     * Actual $mdIcon service is essentially a lookup function
     * @param {*} id $sce trust wrapper over a URL string, URL, icon registry id, or icon set id
     * @returns {angular.$q.Promise}
     */
    function getIcon(id) {
      id = id || '';
  
      // If the "id" provided is not a string, the only other valid value is a $sce trust wrapper
      // over a URL string. If the value is not trusted, this will intentionally throw an error
      // because the user is attempted to use an unsafe URL, potentially opening themselves up
      // to an XSS attack.
      if (!angular.isString(id)) {
        id = $sce.getTrustedUrl(id);
      }
  
      // If already loaded and cached, use a clone of the cached icon.
      // Otherwise either load by URL, or lookup in the registry and then load by URL, and cache.
  
      if (iconCache[id]) {
        return $q.when(transformClone(iconCache[id]));
      }
  
      if (urlRegex.test(id) || dataUrlRegex.test(id)) {
        return loadByURL(id).then(cacheIcon(id));
      }
  
      if (id.indexOf(':') === -1) {
        id = '$default:' + id;
      }
  
      const load = config[id] ? loadByID : loadFromIconSet;
      return load(id)
        .then(cacheIcon(id));
    }
  
    /**
     * Lookup a registered fontSet style using its alias.
     * @param {string} alias used to lookup the alias in the array of fontSets
     * @returns {*} matching fontSet or the defaultFontSet if that alias does not match
     */
    function findRegisteredFontSet(alias) {
      const useDefault = angular.isUndefined(alias) || !(alias && alias.length);
      if (useDefault) {
        return config.defaultFontSet;
      }
  
      let result = alias;
      angular.forEach(config.fontSets, function(fontSet) {
        if (fontSet.alias === alias) {
          result = fontSet.fontSet || result;
        }
      });
  
      return result;
    }
  
    /**
     * @param {Icon} cacheElement cached icon from the iconCache
     * @returns {Icon} cloned Icon element with unique ids
     */
    function transformClone(cacheElement) {
      const clone = cacheElement.clone();
      const newUid = $mdUtil.nextUid();
      let cacheSuffix;
  
      // Verify that the newUid only contains a number and not some XSS content.
      if (!isFinite(Number(newUid))) {
        throw new Error('Unsafe and unexpected non-number result from $mdUtil.nextUid().');
      }
  
      cacheSuffix = '_cache' + newUid;
  
      // For each cached icon, we need to modify the id attributes and references.
      // This is needed because SVG ids are treated as normal DOM ids and should not be duplicated on
      // the page.
      if (clone.id) {
        clone.id += cacheSuffix;
      }
  
      const addCacheSuffixToId = function(match, p1, p2, p3) {
        return [p1, p2, cacheSuffix, p3].join('');
      };
      angular.forEach(clone.querySelectorAll('[id]'), function(descendantElem) {
        descendantElem.id += cacheSuffix;
      });
      // Inject the cacheSuffix into all instances of url(id) and xlink:href="#id".
      // This use of innerHTML should be safe from XSS attack since we are only injecting the
      // cacheSuffix with content from $mdUtil.nextUid which we verify is a finite number above.
      clone.innerHTML = clone.innerHTML.replace(/(.*url\(#)(\w*)(\).*)/g, addCacheSuffixToId);
      clone.innerHTML = clone.innerHTML.replace(/(.*xlink:href="#)(\w*)(".*)/g, addCacheSuffixToId);
  
      return clone;
    }
  
    /**
     * Prepare and cache the loaded icon for the specified `id`.
     * @param {string} id icon cache id
     * @returns {function(*=): *}
     */
    function cacheIcon(id) {
  
      return function updateCache(icon) {
        iconCache[id] = isIcon(icon) ? icon : new Icon(icon, config[id]);
  
        return iconCache[id].clone();
      };
    }
  
    /**
     * Lookup the configuration in the registry, if !registered throw an error
     * otherwise load the icon [on-demand] using the registered URL.
     * @param {string} id icon registry id
     * @returns {angular.$q.Promise}
     */
    function loadByID(id) {
      const iconConfig = config[id];
      return loadByURL(iconConfig.url).then(function(icon) {
        return new Icon(icon, iconConfig);
      });
    }
  
    /**
     * Loads the file as XML and uses querySelector( <id> ) to find the desired node...
     * @param {string} id icon id in icon set
     * @returns {angular.$q.Promise}
     */
    function loadFromIconSet(id) {
      const setName = id.substring(0, id.lastIndexOf(':')) || '$default';
      const iconSetConfig = config[setName];
  
      return !iconSetConfig ? announceIdNotFound(id) : loadByURL(iconSetConfig.url).then(extractFromSet);
  
      function extractFromSet(set) {
        const iconName = id.slice(id.lastIndexOf(':') + 1);
        const icon = set.querySelector('#' + iconName);
        return icon ? new Icon(icon, iconSetConfig) : announceIdNotFound(id);
      }
  
      function announceIdNotFound(id) {
        const msg = 'icon ' + id + ' not found';
        $log.warn(msg);
  
        return $q.reject(msg || id);
      }
    }
  
    /**
     * Load the icon by URL (may use the $templateCache).
     * Extract the data for later conversion to Icon
     * @param {string} url icon URL
     * @returns {angular.$q.Promise}
     */
    function loadByURL(url) {
      /* Load the icon from embedded data URL. */
      function loadByDataUrl(url) {
        const results = dataUrlRegex.exec(url);
        const isBase64 = /base64/i.test(url);
        const data = isBase64 ? window.atob(results[2]) : results[2];
  
        return $q.when(angular.element(data)[0]);
      }
  
      /* Load the icon by URL using HTTP. */
      function loadByHttpUrl(url) {
        return $q(function(resolve, reject) {
          // Catch HTTP or generic errors not related to incorrect icon IDs.
          const announceAndReject = function(err) {
              const msg = angular.isString(err) ? err : (err.message || err.data || err.statusText);
              $log.warn(msg);
              reject(err);
            },
            extractSvg = function(response) {
              if (!svgCache[url]) {
                svgCache[url] = angular.element('<div>').append(response)[0].querySelector('svg');
              }
              resolve(svgCache[url]);
            };
  
          $templateRequest(url, true).then(extractSvg, announceAndReject);
        });
      }
  
      return dataUrlRegex.test(url)
        ? loadByDataUrl(url)
        : loadByHttpUrl(url);
    }
  
    /**
     * Check target signature to see if it is an Icon instance.
     */
    function isIcon(target) {
      return angular.isDefined(target.element) && angular.isDefined(target.config);
    }
  
    /**
     *  Define the Icon class
     */
    function Icon(el, config) {
      // If the node is a <symbol>, it won't be rendered so we have to convert it into <svg>.
      if (el && el.tagName.toLowerCase() === 'symbol') {
        const viewbox = el.getAttribute('viewBox');
        el = angular.element('<svg xmlns="http://www.w3.org/2000/svg">').html(el.innerHTML)[0];
        if (viewbox) el.setAttribute('viewBox', viewbox);
      }
  
      if (el && el.tagName.toLowerCase() !== 'svg') {
        el = angular.element('<svg xmlns="http://www.w3.org/2000/svg">').append(el.cloneNode(true))[0];
      }
  
      // Inject the namespace if not available...
      if (!el.getAttribute('xmlns')) {
        el.setAttribute('xmlns', "http://www.w3.org/2000/svg");
      }
  
      this.element = el;
      this.config = config;
      this.prepare();
    }
  
    /**
     *  Prepare the DOM element that will be cached in the
     *  loaded iconCache store.
     */
    function prepareAndStyle() {
      const viewBoxSize = this.config ? this.config.viewBoxSize : config.defaultViewBoxSize;
      angular.forEach({
        'fit': '',
        'height': '100%',
        'width': '100%',
        'preserveAspectRatio': 'xMidYMid meet',
        'viewBox': this.element.getAttribute('viewBox') || ('0 0 ' + viewBoxSize + ' ' + viewBoxSize),
        'focusable': false // Disable IE11s default behavior to make SVGs focusable
      }, function(val, attr) {
        this.element.setAttribute(attr, val);
      }, this);
    }
  
    /**
     * Clone the Icon DOM element.
     */
    function cloneSVG() {
      // If the element or any of its children have a style attribute, then a CSP policy without
      // 'unsafe-inline' in the style-src directive, will result in a violation.
      return this.element.cloneNode(true);
    }
  
  }
  function mdIconDirective($mdIcon, $mdTheming, $mdAria, $sce) {

  return {
    restrict: 'E',
    link : postLink
  };


  /**
   * Directive postLink
   * Supports embedded SVGs, font-icons, & external SVGs
   */
  function postLink(scope, element, attr) {
    $mdTheming(element);
    let lastFontIcon = attr.mdFontIcon;
    let lastFontSet = $mdIcon.fontSet(attr.mdFontSet);

    prepareForFontIcon();

    attr.$observe('mdFontIcon', fontIconChanged);
    attr.$observe('mdFontSet', fontIconChanged);

    // Keep track of the content of the svg src so we can compare against it later to see if the
    // attribute is static (and thus safe).
    const originalSvgSrc = element[0].getAttribute(attr.$attr.mdSvgSrc);

    // If using a font-icon, then the textual name of the icon itself
    // provides the aria-label.

    const attrName = attr.$normalize(attr.$attr.mdSvgIcon || attr.$attr.mdSvgSrc || '');

    /* Provide a default accessibility role of img */
    if (!attr.role) {
      $mdAria.expect(element, 'role', 'img');
      /* manually update attr variable */
      attr.role = 'img';
    }
    /* Don't process ARIA if already valid */
    if ( attr.role === "img" && !attr.ariaHidden && !$mdAria.hasAriaLabel(element) ) {
      let iconName;
      if (attr.alt) {
        /* Use alt text by default if available */
        $mdAria.expect(element, 'aria-label', attr.alt);
      } else if ($mdAria.parentHasAriaLabel(element, 2)) {
        /* Parent has ARIA so we will assume it will describe the image */
        $mdAria.expect(element, 'aria-hidden', 'true');
      } else if (iconName = (attr.mdFontIcon || attr.mdSvgIcon || element.text())) {
        /* Use icon name as aria-label */
        $mdAria.expect(element, 'aria-label', iconName);
      } else {
        /* No label found */
        $mdAria.expect(element, 'aria-hidden', 'true');
      }
    }

    if (attrName) {
      // Use either pre-configured SVG or URL source, respectively.
      attr.$observe(attrName, function(attrVal) {
        element.empty();
        if (attrVal) {
          $mdIcon(attrVal)
            .then(function(svg) {
            element.empty();
            element.append(svg);
          });
        }
      });
    }

    function prepareForFontIcon() {
      if (!attr.mdSvgIcon && !attr.mdSvgSrc) {
        if (attr.mdFontIcon) {
          element.addClass('md-font ' + attr.mdFontIcon);
        }

        element.addClass(lastFontSet);
      }
    }

    function fontIconChanged() {
      if (!attr.mdSvgIcon && !attr.mdSvgSrc) {
        if (attr.mdFontIcon) {
          element.removeClass(lastFontIcon);
          element.addClass(attr.mdFontIcon);

          lastFontIcon = attr.mdFontIcon;
        }

        const fontSet = $mdIcon.fontSet(attr.mdFontSet);

        if (lastFontSet !== fontSet) {
          element.removeClass(lastFontSet);
          element.addClass(fontSet);

          lastFontSet = fontSet;
        }
      }
    }
  }
}
