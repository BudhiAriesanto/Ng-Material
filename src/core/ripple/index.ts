import { NgModule } from 'angular-ts-decorators';
import { MdButtonInkRippleService } from './buttonInkRipple';
import { MdInkRippleProvider, MdInkRippleServices } from './inkRipple';
export { MdButtonInkRippleService };

@NgModule({
  id: 'ng.material.core.ripple',
  imports: ['ng', 'ng.material.core.util'],
  providers: [
    MdButtonInkRippleService
  ]
})
export default class MaterialCoreRipple {
  static config($mdInkRippleProvider: MdInkRippleProvider) {
    'ngInject';
  }
  static run($mdInkRipple: MdInkRippleServices) {
    'ngInject';
  }
}

(function(module: ng.IModule) {
  module.provider('$mdInkRipple', MdInkRippleServices as any);
})((<NgModule> MaterialCoreRipple).module);
