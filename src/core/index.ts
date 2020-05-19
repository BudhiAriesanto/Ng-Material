import * as ng from 'angular';
import MaterialCoreUtil, * as a from  './util';
import * as b from  './decorator';
import { NgModule } from 'angular-ts-decorators';
import { MdInteractionService } from './interactionServices';
import { RxJs, IObserveable, IRootScopeRx, IRxJsOperator, IRxJsService, IScopeWatch, IScopeWatchMerge, ISubscriber, RxJsRootScope } from './rxjs';
import { MdConstantServices } from './constants';
import { MdAnimateService } from './animate';
import MaterialCoreMeta from './meta';
import MaterialCoreRipple from './ripple';
import MaterialCoreTheming from './theming';
import { MaterialCoreThemingPalette } from './theming/pallete';
import { MdAutofocusDirective, MdSideNavAutofocusDirective } from './directive/autofocus';
import { MdMediaService } from './media';
import { MdCompilerServices } from './compiler';
import { MdAriaServices } from './aria';
import { MdInterimElementService } from './interElement';
export { MdInteractionService };
export { MdButtonInkRippleService } from './ripple';
export { IObserveable, IRootScopeRx, IRxJsOperator, IRxJsService, IScopeWatch, IScopeWatchMerge, ISubscriber};
export { NgService, method } from './decorator';
// export { IMDUtilServices } from './interface/IMDUtilService';
export const util = a;
export const decorator = b;
@NgModule({
  id: 'ng.material.core',
  declarations: [
    MdAutofocusDirective,
    MdSideNavAutofocusDirective
  ],
  providers: [
    MdConstantServices,
    MdInteractionService ,
    MdAnimateService,
    MdMediaService,
    {provide: '$rx', useFactory: RxJs.factory},
  ],
  imports: [
    'ng', 'ngAnimate',
    MaterialCoreMeta,
    MaterialCoreThemingPalette,
    // 'ng.material.core.util',
    // 'ng.material.core.ripple',
    MaterialCoreUtil,
    MaterialCoreRipple,
    'material.core.js',
    MaterialCoreTheming
  ]
})
export default class MaterialCore {
  static config($provide: ng.IModule) {
    'ngInject';
    $provide.decorator('$rootScope', RxJsRootScope);
  }
  static run() {
    'ngInject';
  }
}
(function(module: ng.IModule) {
  module.provider('$rootElement', function(): any {
    this.$get = ['$injector', function($injector: any) {
      const originalRootElement = ng.element(document).data('$injector', $injector);
      return originalRootElement;
    }];
  });
  module.provider('$mdCompiler', MdCompilerServices as any);
  module.provider('$mdAria', MdAriaServices as any);
  module.provider('$$interimElement1', MdInterimElementService as any);
})((<NgModule>MaterialCore).module);
