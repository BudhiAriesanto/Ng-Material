import * as ng from 'angular';
import { NgService } from '../decorator';
import { IRxJsService } from '..';


@NgService('$mdUtil')
export class MDUtilServices {
  /* @ngInject */
  constructor(  $document: ng.IDocumentService,
                $timeout: ng.ITimeoutService,
                $compile: ng.ICompileService,
                $rootScope: ng.IRootScopeService,
                $$mdAnimate: any,
                $interpolate: ng.IInterpolateService,
                $log: ng.ILogService,
                $window: ng.IWindowService,
                $$rAF: any,
                $rx: IRxJsService,
                $injector: ng.auto.IInjectorService) {
    // asdasd
  }
}
