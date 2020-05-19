import { NgModule } from 'angular-ts-decorators';
import { RxJsRootScope,  } from './core/rxjs';
import MaterialCore from './core';
import MaterialComponent from './components';

// require('./core/util/index');
// require('./core/ripple/index');
// require('./core/index');
// require('./components/index');

@NgModule({
  id: 'ng.material',
  imports: [
    'ng', 'ngAnimate', 'ngAria',
    'material.core.layout',
    // 'ng.material.core',
    MaterialCore,
    // 'ng.material.component'
    MaterialComponent
  ]
})
export default class NgMaterial {
  /* @ngInject */
  static config($provide: ng.IModule) {
    $provide.decorator('$rootScope', RxJsRootScope);
  }
  static run() {
    'ngInject';
  }
}


