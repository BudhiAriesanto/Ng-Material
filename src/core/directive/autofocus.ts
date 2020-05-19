import * as ng from 'angular';
import { Directive } from 'angular-ts-decorators';
import { NgService, method } from '../decorator';

@NgService()
class AutofocusCompile implements ng.IDirectivePrePost {

  constructor(private templateElement: JQLite, private templateAttributes: ng.IAttributes, transclude?: ng.ITranscludeFunction) {
  }
  private updateExpression(value: any) {
    // Rather than passing undefined to the jqLite toggle class function we explicitly set the
    // value to true. Otherwise the class will be just toggled instead of being forced.
    if (ng.isUndefined(value)) {
      value = true;
    }
    this.templateElement.toggleClass('md-autofocus', !!value);
  }
  @method
  public pre(scope: ng.IScope, element: JQLite, attrs: ng.IAttributes, ctrl: MdAutofocusDirective, transcludeFn: ng.ITranscludeFunction) {
    let attr = this.templateAttributes;
    let attrExp = attr.mdAutoFocus || attr.mdAutofocus || attr.mdSidenavFocus;
    // Initially update the expression by manually parsing the expression as per $watch source.
    this.updateExpression(ctrl.$parse(attrExp)(scope));

  }

}

/**
 * @ngdoc directive
 * @name mdAutofocus
 * @module material.core.util
 *
 * @description
 *
 * `[md-autofocus]` provides an optional way to identify the focused element when a `$mdDialog`,
 * `$mdBottomSheet`, `$mdMenu` or `$mdSidenav` opens or upon page load for input-like elements.
 *
 * When one of these opens, it will find the first nested element with the `[md-autofocus]`
 * attribute directive and optional expression. An expression may be specified as the directive
 * value to enable conditional activation of the autofocus.
 *
 * @usage
 *
 * ### Dialog
 * <hljs lang="html">
 * <md-dialog>
 *   <form>
 *     <md-input-container>
 *       <label for="testInput">Label</label>
 *       <input id="testInput" type="text" md-autofocus>
 *     </md-input-container>
 *   </form>
 * </md-dialog>
 * </hljs>
 *
 * ### Bottomsheet
 * <hljs lang="html">
 * <md-bottom-sheet class="md-list md-has-header">
 *  <md-subheader>Comment Actions</md-subheader>
 *  <md-list>
 *    <md-list-item ng-repeat="item in items">
 *
 *      <md-button md-autofocus="$index == 2">
 *        <md-icon md-svg-src="{{item.icon}}"></md-icon>
 *        <span class="md-inline-list-icon-label">{{ item.name }}</span>
 *      </md-button>
 *
 *    </md-list-item>
 *  </md-list>
 * </md-bottom-sheet>
 * </hljs>
 *
 * ### Autocomplete
 * <hljs lang="html">
 *   <md-autocomplete
 *       md-autofocus
 *       md-selected-item="selectedItem"
 *       md-search-text="searchText"
 *       md-items="item in getMatches(searchText)"
 *       md-item-text="item.display">
 *     <span md-highlight-text="searchText">{{item.display}}</span>
 *   </md-autocomplete>
 * </hljs>
 *
 * ### Sidenav
 * <hljs lang="html">
 * <div layout="row" ng-controller="MyController">
 *   <md-sidenav md-component-id="left" class="md-sidenav-left">
 *     Left Nav!
 *   </md-sidenav>
 *
 *   <md-content>
 *     Center Content
 *     <md-button ng-click="openLeftMenu()">
 *       Open Left Menu
 *     </md-button>
 *   </md-content>
 *
 *   <md-sidenav md-component-id="right"
 *     md-is-locked-open="$mdMedia('min-width: 333px')"
 *     class="md-sidenav-right">
 *     <form>
 *       <md-input-container>
 *         <label for="testInput">Test input</label>
 *         <input id="testInput" type="text"
 *                ng-model="data" md-autofocus>
 *       </md-input-container>
 *     </form>
 *   </md-sidenav>
 * </div>
 * </hljs>
 */
@Directive({
  selector: 'mdAutofocus',
  compile: AutofocusCompile as any
})
export class MdAutofocusDirective implements ng.IController {
  constructor(public $parse: ng.IParseService) {
    'ngInject';
  }
}
@Directive({
  selector: 'mdSidenavFocus',
  compile: AutofocusCompile as any
})
export class MdSideNavAutofocusDirective implements ng.IController {
  constructor(public $parse: ng.IParseService) {
    'ngInject';
  }
}

