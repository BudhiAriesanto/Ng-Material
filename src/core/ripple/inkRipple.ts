import * as ng from 'angular';
import { IMDUtilServices } from '../util';
import { NgService, NgProvider, method} from '../decorator';
import { IRxJsService } from '../rxjs';
import { Hammer} from '../../hammerjs';
import { TapRecognizer } from '../../hammerjs/recognizers';



export interface IRippleOptions {
  center?: boolean;
  dimBackground?: boolean;
  colorElement?: HTMLElement;
  fitRipple?: boolean;
}

class InkRippleCtrl {
  private container: JQLite;
  private _color: string ;
  constructor($scope: ng.IScope,
              private $element: JQLite,
              private rippleOptions: IRippleOptions,
              private $window: ng.IWindowService,
              private $timeout: ng.ITimeoutService,
              private $mdUtil: IMDUtilServices,
              private $mdColorUtil: any,
              $rx: IRxJsService,
              $mdInkRipple: MdInkRippleServices) {
    'ngInject';
    // let mc = new Hammer($element[0]);
    // mc.add(new TapRecognizer({ event: 'singleTap'}));
    // mc.on('singleTap', (evt: any) => {
      // console.log('singletap');
    // });
    this.$element.addClass(`md-ink-ripple`);
    this.createContainer();
    // attach method for unit tests
    // ($element.controller('mdInkRipple') || {}).createRipple = ng.bind(this, this.createRipple);
    // ($element.controller('mdInkRipple') || {}).setColor = ng.bind(this, this.color);
    let down = 0, up = 0;
    const { fromEvent, merge, operators, timer } =  $rx;
    const { map, filter, delay, concatMap } = operators;
    const timeoutObs = timer($mdInkRipple.duration());
    const downObs = fromEvent($element, 'mousedown')
    .pipe(
      map( ( {clientX, clientY, offsetX, offsetY}: MouseEvent )  => {
        let ripple: JQLite;
        if (this.rippleOptions.center) {
          ripple = this.createRipple(this.container.prop('clientWidth') / 2, this.container.prop('clientWidth') / 2);
        } else {
          // We need to calculate the relative coordinates if the target is a sublayer of the ripple element
          if (event.srcElement !== this.$element[0]) {
            const layerRect = this.$element[0].getBoundingClientRect();
            const layerX = clientX - layerRect.left;
            const layerY = clientY - layerRect.top;
            ripple = this.createRipple(layerX, layerY);
          } else {
            ripple = this.createRipple(offsetX, offsetY);
          }
        }
        this.container.append(ripple.addClass('md-ripple-placed')[0]);
        down++;
        return ripple;
      }),
      delay(0),
      // map((ripple: JQLite): JQLite => ripple.css('transition-duration', `${$mdInkRipple.duration()}ms`)),
      // delay(0),
      map((ripple: JQLite): JQLite => ripple.addClass('md-ripple-scaled md-ripple-active')),
      concatMap((ripple: JQLite) => timeoutObs.pipe(map( index => ripple))),
      filter((ripple: JQLite) => {
        down--;
        if (up > 0) {
          up--;
          ripple.removeClass('md-ripple-active').addClass('md-ripple-remove');
          return true;
        }
        return false;
      }),
      concatMap((ripple: JQLite) => timeoutObs.pipe(map( index => ripple))),
      map((ripple: JQLite) => {
        ripple.remove();
        return false;
      })
    );
    const upObs =  fromEvent($element, 'mouseup').pipe(
      map((v: MouseEvent) => {
        let ripple: JQLite;
        if (down === 0 ) {
          ripple = ng.element(this.container[0].children[0]);
          ripple.removeClass('md-ripple-active').addClass('md-ripple-remove');
        } else {
          up++;
        }
        return ripple;
      }),
      filter(ripple => ripple !== undefined),
      concatMap((ripple: JQLite) => timeoutObs.pipe(map( index => ripple.remove() ))),
    );
    const subs = merge(downObs, upObs).subscribe ( (v) => {
      if (down === 0 && up === 0) { this.container.css({ backgroundColor: '' }); }
    });
    $scope.$on('destroy', () => { subs.unsubscribe(); });
  }
  private createContainer = () => {
    this.container = ng.element(`<div/>`).addClass('md-ripple-container');
    // this.container1 = this.container[0].attachShadow({mode: 'open'});
    // var elSty le = document.createElement('style');
    // elStyle.innerHTML = require('./test.scss').toString();
    // this.container.append(elStyle);
    this.$element.append(this.container);
  }
  private inkRipple = (): string => {
    return this.$element.attr('md-ink-ripple');
  }
  private isRippleAllow = () => {
    let el: HTMLElement = this.$element[0];
    const { tagName, hasAttribute, parentNode } = el;
    do {
      if (!tagName || tagName === 'BODY') { break; }
      if (el && hasAttribute instanceof Function) {
        if (hasAttribute('disabled')) { return false; }
        if (this.inkRipple() === 'false' || this.inkRipple() === '0') { return false; }
      }
    } while ( el = parentNode as HTMLElement);
  }
  private color = (color?: string): string => {
    if (color) { return this._color = this.parseColor(color); }
    const { $mdUtil, rippleOptions} = this;
    const { colorElement } = rippleOptions;
    return this._color || this.parseColor((colorElement ? $mdUtil.hasComputedStyle(colorElement, 'color', undefined, 'rgb(0,0,0)') : 'rgb(0,0,0)') as string);
  }
  private parseColor = ( color: string, multiplier?: any) => {
    multiplier = multiplier || 1;
    const { $mdColorUtil } = this;
    if (!color) { return; }
    if (color.indexOf('rgba') === 0) {
      return color.replace(/\d?\.?\d*\s*\)\s*$/, (0.1 * multiplier).toString() + ')');
    }
    if (color.indexOf('rgb') === 0) {
      return $mdColorUtil.rgbToRgba(color);
    }
    if (color.indexOf('#') === 0) {
      return $mdColorUtil.hexToRgba(color);
    }
  }

  private createRipple = (left = 0, top = 0): JQLite => {
    if (!this.isRippleAllow) { return; }
    const ripple = ng.element('<div/>').addClass('md-ripple');
    const { clientWidth, clientHeight } = this.$element[0] as HTMLElement;
    const {x, y, width, height} = {
      x: Math.max(Math.abs(clientWidth - left), left) * 2,
      y: Math.max(Math.abs(clientHeight - top), top) * 2,
      width: clientWidth,
      height: clientHeight
    };
    const size = this.rippleOptions.fitRipple ? Math.max(x, y) : Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    const color = this.color();
    ripple.css({
      left:            left + 'px',
      top:             top + 'px',
      background:      'black',
      width:           size + 'px',
      height:          size + 'px',
      backgroundColor: this.$mdColorUtil.rgbaToRgb(color),
      borderColor:     this.$mdColorUtil.rgbaToRgb(color)
    });
    if (this.rippleOptions.dimBackground) { this.container.css({ backgroundColor: color }); }

    return ripple;

  }

}



export abstract class MdInkRippleProvider {
  protected isDisabledGlobally = false;
  protected rippleDuration = 250;
  constructor(protected $injector?: ng.auto.IInjectorService) {
    'nginject';
  }
  @method
  public disableInkRipple() { this.isDisabledGlobally = true; }

  @method
  public duration(duration?: number): number {
    if (duration) { this.rippleDuration = duration; }
    return this.rippleDuration;
  }
}

@NgProvider(MdInkRippleProvider)
export class MdInkRippleServices extends MdInkRippleProvider {
  constructor(private $mdUtil: any) {
    'ngInject';
    super();
  }

  @method
  public duration(): number { return this.rippleDuration; }

  @method
  public attach(scope: ng.IScope, element: JQLite, options: IRippleOptions = new Object()): InkRippleCtrl {
    const { $mdUtil, isDisabledGlobally } = this;
    if (isDisabledGlobally || element.controller('mdNoInk')) {
      return ng.noop as any; // new InkRippleCtrl(scope, element, options);
    }
    return $mdUtil.instantiate(InkRippleCtrl, {
      $scope:        scope,
      $element:      element,
      rippleOptions: options
    });
  }
}
