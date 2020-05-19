import * as ng from 'angular';
import { NgService, method } from './decorator';
import { MdConstantServices } from './constants';

@NgService('$mdMedia')
export class MdMediaService {
  private queries: any = {};
  private mqls: any = {};
  private results: any = {};
  private normalizeCache: any = {};

  constructor(private $mdConstant: MdConstantServices, private $rootScope: ng.IRootScopeService, private $window: ng.IWindowService) {
    'ngInject';
  }
  // Improves performance dramatically
  private getNormalizedName(attrs: ng.IAttributes, attrName: string) {
    return this.normalizeCache[attrName] ||
        (this.normalizeCache[attrName] = attrs.$normalize(attrName));
  }
  @method
  public getResponsiveAttribute(attrs: ng.IAttributes, attrName: string) {
    for (let i = 0; i < this.$mdConstant.MEDIA_PRIORITY().length; i++) {
      let mediaName: string = this.$mdConstant.MEDIA_PRIORITY(i) as string;
      if (!this.mqls[this.queries[mediaName]].matches) {
        continue;
      }
      let normalizedName = this.getNormalizedName(attrs, attrName + '-' + mediaName);
      if (attrs[normalizedName]) {
        return attrs[normalizedName];
      }
    }
     // fallback on unprefixed
     return attrs[this.getNormalizedName(attrs, attrName)];
  }
  @method
  public getQuery(name: string) {
    return this.mqls[name];
  }
  @method
  public watchResponsiveAttributes(attrNames: Array<string>, attrs: ng.IAttributes, watchFn: Function) {
    let unwatchFns: Array<any> = [];
    attrNames.forEach(function(attrName: string) {
      let normalizedName = this.getNormalizedName(attrs, attrName);
      if (ng.isDefined(attrs[normalizedName])) {
        unwatchFns.push(
            attrs.$observe(normalizedName, ng.bind(void 0, watchFn, null) as any)
        );
      }
      this.$mdConstant.MEDIA().forEach((mediaName: string) => {
        normalizedName = this.getNormalizedName(attrs, attrName + '-' + mediaName);
        if (ng.isDefined(attrs[normalizedName])) {
          unwatchFns.push(attrs.$observe(normalizedName, ng.bind(void 0, watchFn, mediaName) as any));
        }
      });
    });

    return function unwatch() {
      unwatchFns.forEach(function(fn: Function) { fn(); });
    };
  }
  private validate(query: any) {
    return this.$mdConstant.MEDIA(query) ||
           ((query.charAt(0) !== '(') ? ('(' + query + ')') : query);
  }
  private onQueryChange(query: any) {
    this.$rootScope.$evalAsync(function() {
      this.results[query.media] = !!query.matches;
    });
  }

  private add(query: any) {
    let result = this.mqls[query];
    if ( !result ) {
      result = this.mqls[query] = this.$window.matchMedia(query);
    }
    result.addListener(this.onQueryChange);
    return (this.results[result.media] = !!result.matches);
  }

  @method
  public media(query: any) {
    let validated = this.queries[query];
    if (ng.isUndefined(validated)) {
      validated = this.queries[query] = this.validate(query);
    }
    let result = this.results[validated];
    if (ng.isUndefined(result)) {
      result = this.add(validated);
    }
    return result;
  }
}
