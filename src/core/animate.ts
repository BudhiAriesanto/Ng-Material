import * as ng from 'angular';
import { NgService, method } from './decorator';
import { MdConstantServices } from './constants';
import { MDUtilServices } from './util/utilServices';
import { IRxJsService } from '.';
import { IMDUtilServices } from './util';


@NgService('$$mdAnimate')
export class MdAnimateService {
  private $mdUtil: IMDUtilServices;
  constructor(private $q: ng.IQService, private $timeout: ng.ITimeoutService, private $mdConstant: MdConstantServices, private $animateCss: any, private $rx: IRxJsService) {
    'ngInject';
  }
  @method
  public init($mdUtil: IMDUtilServices) {
    this.$mdUtil = $mdUtil;
  }
  private reverseTranslate (target: HTMLElement, from: any, options: any, newFrom?: any) {
    return this.$animateCss(target, {
       to: newFrom || from,
       addClass: options.transitionOutClass,
       removeClass: options.transitionInClass,
       duration: options.duration
    }).start();

  }
  @method
  public translate3d (target: HTMLElement, from: any, to: any, options: any) {
    const self = this;
    return this.$animateCss(target, {
      from: from,
      to: to,
      addClass: options.transitionInClass,
      removeClass: options.transitionOutClass,
      duration: options.duration
    })
    .start()
    .then(function() {
        // Resolve with reverser function...
        return self.reverseTranslate(target, from, options);
    });
  }
  /**
   * Listen for transitionEnd event (with optional timeout)
   * Announce completion or failure via promise handlers
   */
  @method
  public waitTransitionEnd(element: JQLite, opts: any): ng.IPromise<Event> {
    let TIMEOUT: number = 3000; // fallback is 3 secs
    let styles = opts.cachedTransitionStyles || window.getComputedStyle(element[0]);
    let noTransition: boolean = styles.transitionDuration === '0s' || (!styles.transition && !styles.transitionProperty);
    let { fromEvent, of } = this.$rx;
    let { timeout, catchError, take } = this.$rx.operators;
    if (noTransition) { TIMEOUT = 0; }
    return fromEvent(element[0], this.$mdConstant.CSS().TRANSITIONEND)
    .pipe(
      timeout(TIMEOUT),
      catchError((err: any) => {
        return of(undefined);
      }),
      take(1)
    ).toPromise();
  }
  @method
  public calculateTransformValues(element: JQLite, originator: any): {centerX: number, centerY: number, scaleX: number, scaleY: number} {
    const origin = originator.element;
    const bounds = originator.bounds;
    const clientRect = (el: JQLite| HTMLElement): ClientRect => {
      let bound = this.$mdUtil.clientRect(el);
      return  (bound && bound.width > 0 && bound.height > 0 ? Object.assign({}, bound) : null);
    };
    const currentBounds = () => {
      const cntr = element ? element.parent() : null;
      const parent = cntr ? cntr.parent() : null;
      return parent ? clientRect(parent) : null;
    };
    if (origin || bounds) {
      const originBnds = origin ? clientRect(origin) || currentBounds() : Object.assign({}, bounds);
      const dialogRect = Object.assign({}, element[0].getBoundingClientRect());
      const dialogCenterPt = this.$mdUtil.centerPointByRect(dialogRect);
      const originCenterPt = this.$mdUtil.centerPointByRect(originBnds);
      return {
        centerX: originCenterPt.x - dialogCenterPt.x,
        centerY: originCenterPt.y - dialogCenterPt.y,
        scaleX: Math.round(100 * Math.min(0.5, originBnds.width / dialogRect.width)) / 100,
        scaleY: Math.round(100 * Math.min(0.5, originBnds.height / dialogRect.height)) / 100
      };
    }
    return {centerX: 0, centerY: 0, scaleX: 0.5, scaleY: 0.5};
  }
  /**
   * Calculate the zoom transform from dialog to origin.
   *
   * We use this to set the dialog position immediately;
   * then the md-transition-in actually translates back to
   * `translate3d(0,0,0) scale(1.0)`...
   *
   * NOTE: all values are rounded to the nearest integer
   */
  @method
  public calculateZoomToOrigin(element: JQLite, originator: any) {
    const zoomTemplate = 'translate3d( {centerX}px, {centerY}px, 0 ) scale( {scaleX}, {scaleY} )';
    const buildZoom = ng.bind(null, this.$mdUtil.supplant, zoomTemplate);

    return buildZoom(this.calculateTransformValues(element, originator));
  }
  /**
   * Calculate the slide transform from panel to origin.
   * NOTE: all values are rounded to the nearest integer
   */
  @method
  public calculateSlideToOrigin(element: JQLite, originator: any) {
    const slideTemplate = 'translate3d( {centerX}px, {centerY}px, 0 )';
    const buildSlide = ng.bind(null, this.$mdUtil.supplant, slideTemplate);
    return buildSlide(this.calculateTransformValues(element, originator));
  }
  /**
   * Enhance raw values to represent valid css stylings...
   */
  @method
  public toCss( raw: any ) {
    let css: any = { };
    const lookups = 'left top right bottom width height x y min-width min-height max-width max-height';
    const convertToVendor = (key: any, vendor: any, value: any)  => {
      ng.forEach(vendor.split(' '), function (key: any) {
        css[key] = value;
      });
    };
    let self = this;
    ng.forEach(raw, function(value: any, key: any) {
      if ( ng.isUndefined(value) ) {
        return;
      }
      if ( lookups.indexOf(key) >= 0 ) {
        css[key] = value + 'px';
      } else {
        switch (key) {
          case 'transition':
            convertToVendor(key, self.$mdConstant.CSS().TRANSITION, value);
            break;
          case 'transform':
            convertToVendor(key, self.$mdConstant.CSS().TRANSFORM, value);
            break;
          case 'transformOrigin':
            convertToVendor(key, self.$mdConstant.CSS().TRANSFORM_ORIGIN, value);
            break;
          case 'font-size':
            css['font-size'] = value; // font sizes aren't always in px
            break;
        }
      }
    });

    return css;
  }
  /**
   * Convert the translate CSS value to key/value pair(s).
   */
  @method
  public toTransformCss(transform: any, addTransition?: any, transition?: any) {
    let css: any = {};
    this.$mdConstant.CSS().TRANSFORM.split(' ').filter((key: string) => {
      css[key] = transform;
      return false;
    });
    if (addTransition) {
      transition = transition || 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important';
      css.transition = transition;
    }
    return css;
  }
}

