import * as ng from 'angular';
import { NgProvider, method } from './decorator';
import { NgModule } from 'angular-ts-decorators';


// (function(m: ng.IModule) {
  // m.provider('$$mdMeta', MdMetaServices as any);
// })((<NgModule> MaterialCoreMeta).module);




/**
 * @ngdoc service
 * @name $$mdMeta
 * @module material.core.meta
 *
 * @description
 *
 * A provider and a service that simplifies meta tags access
 *
 * Note: This is intended only for use with dynamic meta tags such as browser color and title.
 * Tags that are only processed when the page is rendered (such as `charset`, and `http-equiv`)
 * will not work since `$$mdMeta` adds the tags after the page has already been loaded.
 *
 * ```js
 * app.config(function($$mdMetaProvider) {
 *   var removeMeta = $$mdMetaProvider.setMeta('meta-name', 'content');
 *   var metaValue  = $$mdMetaProvider.getMeta('meta-name'); // -> 'content'
 *
 *   removeMeta();
 * });
 *
 * app.controller('myController', function($$mdMeta) {
 *   var removeMeta = $$mdMeta.setMeta('meta-name', 'content');
 *   var metaValue  = $$mdMeta.getMeta('meta-name'); // -> 'content'
 *
 *   removeMeta();
 * });
 * ```
 *
 * @returns {$$mdMeta.$service}
 *
 */
export class MdMetaProvider {
  protected head = ng.element(document.getElementsByTagName('head')[0]);
  protected metaElements: any = {};
  constructor($injector?: ng.auto.IInjectorService) {
    'ngInject';
  }
  /**
   * Checks if the requested element was written manually and maps it
   *
   * @param {string} name meta tag 'name' attribute value
   * @returns {boolean} returns true if there is an element with the requested name
   */
  protected mapExistingElement(name: any) {
    if (this.metaElements[name]) {
      return true;
    }

    const element = document.getElementsByName(name)[0];

    if (!element) {
      return false;
    }

    this.metaElements[name] = ng.element(element);

    return true;
  }
  /**
   * @ngdoc method
   * @name $$mdMeta#setMeta
   *
   * @description
   * Creates meta element with the 'name' and 'content' attributes,
   * if the meta tag is already created than we replace the 'content' value
   *
   * @param {string} name meta tag 'name' attribute value
   * @param {string} content meta tag 'content' attribute value
   * @returns {function} remove function
   *
   */
  @method
  public setMeta(name: string, content: string) {
    this.mapExistingElement(name);

    if (!this.metaElements[name]) {
      const newMeta = ng.element(`<meta name="${name}" content="${content}"/>`);
      this.head.append(newMeta);
      this.metaElements[name] = newMeta;
    } else {
      this.metaElements[name].attr('content', content);
    }

    return function () {
      this.metaElements[name].attr('content', '');
      this.metaElements[name].remove();
      delete this.metaElements[name];
    };
  }
  /**
   * @ngdoc method
   * @name $$mdMeta#getMeta
   *
   * @description
   * Gets the 'content' attribute value of the wanted meta element
   *
   * @param {string} name meta tag 'name' attribute value
   * @returns {string} content attribute value
   */
  @method
  public getMeta(name: string) {
    if (!this.mapExistingElement(name)) {
      throw Error('$$mdMeta: could not find a meta tag with the name \'' + name + '\'');
    }
    return this.metaElements[name].attr('content');
  }

}
@NgProvider(MdMetaProvider)
export class MdMetaServices extends MdMetaProvider {
  constructor() {
    'ngInject';
    super();
  }
  @method
  public _setMeta(name: string, content: string) {
    super.setMeta(name, content);
  }
  @method
  public _getMeta(name: string) {
    return super.getMeta(name);
  }
}
@NgModule({
  id: 'ng.material.core.meta'
})
export default class MaterialCoreMeta {
  static config() {
    'ngInject';
  }
  static run() {
    'ngInject';
  }
}
(function(module: ng.IModule) {
  module.provider('$$mdMeta', MdMetaServices as any);
})((<NgModule> MaterialCoreMeta).module);

