import * as ng from 'angular';
import { IMDUtilServices } from '.';

export class Prefixer {
  private PREFIXES: Array<any>;
  constructor(private $mdUtil: IMDUtilServices) {
    this.PREFIXES = ['data', 'x'];
  }

  public buildList(attributes: string[] | string): string[] {
    const self = this;
    attributes = (ng.isArray(attributes) ? attributes : [attributes]) as string[];
    let result: string[] = [...attributes];
    attributes.forEach(function(item: any) {
      result = [...result, ...self.PREFIXES.map((prefix: string) => `${prefix}-${item}`)];
    });
    return result;
  }
  public buildSelector(attributes: any) {
    attributes = ng.isArray(attributes) ? attributes : [attributes];
    return this.buildList(attributes).map((item: any) => `[${item}]`).join(',');
  }
  public hasAttribute(element: any, attribute: any) {
    element = this.$mdUtil.getNativeElement(element);
    if (!element) {
      return false;
    }
    const prefixedAttrs = this.buildList(attribute);
    for (let i = 0; i < prefixedAttrs.length; i++) {
      if (element.hasAttribute(prefixedAttrs[i])) {
        return true;
      }
    }
    return false;
  }
}
