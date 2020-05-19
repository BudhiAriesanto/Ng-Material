import * as ng from 'angular';
import { NgService, method } from '../decorator';


@NgService('$mdColorUtil')
export class MdColorServices {
  constructor() {
    'ngInject';
  }
  /**
   * Converts hex value to RGBA string
   * @param color {string}
   * @returns {string}
   */
  @method
  public hexToRgba(color: string): string {
    let hex   = color[0] === '#' ? color.substr(1) : color,
    dig   = hex.length / 3,
    red   = hex.substr(0, dig),
    green = hex.substr(dig, dig),
    blue  = hex.substr(dig * 2);
    if (dig === 1) {
      red += red;
      green += green;
      blue += blue;
    }
    return 'rgba(' + parseInt(red, 16) + ',' + parseInt(green, 16) + ',' + parseInt(blue, 16) + ',0.1)';
  }

  /**
   * Converts rgba value to hex string
   * @param color {string}
   * @returns {string}
   */
  @method
  public rgbaToHex(color: string): string {
    let clr = color.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    let hex = (clr && clr.length === 4) ? `
    #${('0' + parseInt(color[1], 10).toString(16)).slice(-2)}
    ${('0' + parseInt(color[2], 10).toString(16)).slice(-2)}
    ${('0' + parseInt(color[3], 10).toString(16)).slice(-2)}`
    : '';
    return hex.toUpperCase();
  }

  /**
   * Converts an RGB color to RGBA
   * @param color {string}
   * @returns {string}
   */
  @method
  public rgbToRgba (color: string): string {
    return color.replace(')', ', 0.1)').replace('(', 'a(');
  }

  /**
   * Converts an RGBA color to RGB
   * @param color {string}
   * @returns {string}
   */
  @method
  public rgbaToRgb (color: string): string {
    return color
      ? color.replace('rgba', 'rgb').replace(/,[^),]+\)/, ')')
      : 'rgb(0,0,0)';
  }

}



