import * as ng from 'angular';
import { NgService, method } from '../decorator';
@NgService('$mdButtonInkRipple')
export class MdButtonInkRippleService {
  /* @ngInject */
  constructor(private $mdInkRipple: any) { }
  private optionsForElement(element: JQLite) {
    if (element.hasClass('md-icon-button')) {
      return {
        isMenuItem: element.hasClass('md-menu-item'),
        fitRipple: true,
        center: true
      };
    } else {
      return {
        isMenuItem: element.hasClass('md-menu-item'),
        dimBackground: true
      };
    }
  }
  @method
  public attach(scope: any, element: JQLite, options: any): any {
    options = ng.extend(this.optionsForElement(element), options);
    return this.$mdInkRipple.attach(scope, element, options);
  }
}


