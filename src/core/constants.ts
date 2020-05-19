import * as ng from 'angular';
import { NgService, method } from './decorator';

type MdConstantsMedia = {
  'xs': '(max-width: 599px)' | string;
  'gt-xs': '(min-width: 600px)'| string;
  'sm': '(min-width: 600px) and (max-width: 959px)' | string;
  'gt-sm': '(min-width: 960px)' | string;
  'md': '(min-width: 960px) and (max-width: 1279px)' | string;
  'gt-md': '(min-width: 1280px)' | string;
  'lg': '(min-width: 1280px) and (max-width: 1919px)' | string;
  'gt-lg': '(min-width: 1920px)' | string;
  'xl': '(min-width: 1920px)' | string;
  'landscape': '(orientation: landscape)' | string;
  'portrait': '(orientation: portrait)' | string;
  'print': 'print';
};
class MdConstantsKeyCode {
  public readonly COMMA: number = 188;
  public readonly SEMICOLON: number =  186;
  public readonly ENTER: number = 13;
  public readonly ESCAPE: number = 27;
  public readonly SPACE: number = 32;
  public readonly PAGE_UP: number = 33;
  public readonly PAGE_DOWN: number = 34;
  public readonly END: number = 35;
  public readonly HOME: number = 36;
  public readonly LEFT_ARROW: number = 37;
  public readonly UP_ARROW: number = 38;
  public readonly RIGHT_ARROW: number = 39;
  public readonly DOWN_ARROW: number = 40;
  public readonly TAB: number = 9;
  public readonly BACKSPACE: number = 8;
  public readonly DELETE: number = 46;
  constructor() { /**  */  }
}

class MdConstantsCSS {
  private prefixTestEl = document.createElement('div');
  private vendorPrefix = this.getVendorPrefix(this.prefixTestEl);
  private SPECIAL_CHARS_REGEXP = /([:\-_]+(.))/g;
  public readonly TRANSITIONEND: string = 'transitionend';
  public readonly ANIMATIONEND: string =  'animationend';
  public readonly TRANSFORM: string = this.vendorProperty('transform');
  public readonly TRANSFORM_ORIGIN: string =  this.vendorProperty('transformOrigin');
  public readonly TRANSITION: string =  this.vendorProperty('transition');
  public readonly TRANSITION_DURATION: string =  this.vendorProperty('transitionDuration');
  public readonly ANIMATION_PLAY_STATE: string =  this.vendorProperty('animationPlayState');
  public readonly ANIMATION_DURATION: string =  this.vendorProperty('animationDuration');
  public readonly ANIMATION_NAME: string =  this.vendorProperty('animationName');
  public readonly ANIMATION_TIMING: string =  this.vendorProperty('animationTimingFunction');
  public readonly ANIMATION_DIRECTION: string =  this.vendorProperty('animationDirection');
  constructor() {
    'ngInject';
    // use for variant css
    // if (this.$mdUtil.isChrome) {
      // this.TRANSITIONEND += ' webkitTransitionEnd';
    // }
  }
  private vendorProperty(name: string) {
    // Add a dash between the prefix and name, to be able to transform the string into camelcase.
    const prefixedName = this.vendorPrefix + '-' + name;
    const ucPrefix = this.camelCase(prefixedName);
    const lcPrefix = ucPrefix.charAt(0).toLowerCase() + ucPrefix.substring(1);

    return this.hasStyleProperty(this.prefixTestEl, name)     ? name     :       // The current browser supports the un-prefixed property
           this.hasStyleProperty(this.prefixTestEl, ucPrefix) ? ucPrefix :       // The current browser only supports the prefixed property.
           this.hasStyleProperty(this.prefixTestEl, lcPrefix) ? lcPrefix : name; // Some browsers are only supporting the prefix in lowercase.
  }
  private hasStyleProperty(testElement: HTMLElement, property: string) {
    return ng.isDefined((<any>testElement.style)[property]);
  }

  private camelCase(input: string) {
    return input.replace(this.SPECIAL_CHARS_REGEXP, function(matches: any, separator: any, letter: any, offset: any) {
      return offset ? letter.toUpperCase() : letter;
    });
  }
  private getVendorPrefix(testElement: HTMLElement): string {
    let prop, match;
    const vendorRegex = /^(Moz|webkit|ms)(?=[A-Z])/;
    for (prop in testElement.style) {
      if (match = vendorRegex.exec(prop)) {
        return match[0];
      }
    }
  }
}
@NgService('$mdConstant')
export class MdConstantServices {
  private mediaPriority: Array<string> = [
    'xl',
    'gt-lg',
    'lg',
    'gt-md',
    'md',
    'gt-sm',
    'sm',
    'gt-xs',
    'xs',
    'landscape',
    'portrait',
    'print'
  ];
  private media: MdConstantsMedia = {
    'xs': '(max-width: 599px)' ,
    'gt-xs': '(min-width: 600px)',
    'sm'        : '(min-width: 600px) and (max-width: 959px)',
    'gt-sm'     : '(min-width: 960px)',
    'md'        : '(min-width: 960px) and (max-width: 1279px)',
    'gt-md'     : '(min-width: 1280px)',
    'lg'        : '(min-width: 1280px) and (max-width: 1919px)',
    'gt-lg'     : '(min-width: 1920px)',
    'xl'        : '(min-width: 1920px)',
    'landscape' : '(orientation: landscape)',
    'portrait'  : '(orientation: portrait)',
    'print' : 'print'
  };
  constructor() {
    'ngInject';
  }
  @method
  public isInputKey (e: KeyboardEvent): boolean {
    return (e.keyCode >= 31 && e.keyCode <= 90);
  }
  @method
  public isNumPadKey (e: KeyboardEvent): boolean {
    return (3 === e.location && e.keyCode >= 97 && e.keyCode <= 105);
  }
  @method
  public isMetaKey(e: KeyboardEvent): boolean {
    return (e.keyCode >= 91 && e.keyCode <= 93);
  }
  @method
  public isFnLockKey(e: any): boolean {
    return (e.keyCode >= 112 && e.keyCode <= 145);
  }
  @method
  public KEY_CODE(): MdConstantsKeyCode  {
    return new MdConstantsKeyCode();
  }
  @method
  public isNavigationKey (e: any): boolean {
      let kc = this.KEY_CODE(), NAVIGATION_KEYS =  [kc.SPACE, kc.ENTER, kc.UP_ARROW, kc.DOWN_ARROW];
      return (NAVIGATION_KEYS.indexOf(e.keyCode) !== -1);
  }
  @method
  public hasModifierKey(e: any): boolean {
      return e.ctrlKey || e.metaKey || e.altKey;
  }
  @method
  public CSS(): MdConstantsCSS {
    return new MdConstantsCSS();
  }
  @method
  public MEDIA(key?: number | string): MdConstantsMedia | any {
    if (!key) { return this.media; }
    if (typeof key === 'number') { return (<any> this.media)[Object.keys(this.media)[key]]; }
    if (typeof key === 'string') { return (<any> this.media)[key]; }
  }
  @method
  public MEDIA_PRIORITY(index?: number): Array<string> | string {
    if (index) { return this.mediaPriority[index]; }
    return this.mediaPriority;
  }
}

