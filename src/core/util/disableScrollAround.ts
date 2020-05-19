import * as ng from 'angular';
import { IMDUtilServices } from '.';

export class DisableScrollAround {
  private body: HTMLBodyElement = document.body as any;
  private element: JQLite ;
  private options: {disableScrollMask: boolean} = {disableScrollMask: false};
  private count = 0;
  private restore: Function[] = [];
  constructor(private $mdUtil: IMDUtilServices) {
    //
  }
  /**
   * Creates a virtual scrolling mask to prevent touchmove, keyboard, scrollbar clicking,
   * and wheel events
   */
  private disableElementScroll = (): Function => {
    let scrollMask: JQLite;
    if (this.options.disableScrollMask) {
      scrollMask = this.element ;
    } else {
      scrollMask = ng.element(
        `<div class="md-scroll-mask">
          <div class="md-scroll-mask-bar"></div>
        '</div>')`
      );
      this.element.append(scrollMask);
    }
    scrollMask.on('wheel', this.$mdUtil.preventDefault);
    scrollMask.on('touchmove', this.$mdUtil.preventDefault);

    return function restoreElementScroll() {
      scrollMask.off('wheel');
      scrollMask.off('touchmove');
      if (!this.options.disableScrollMask && scrollMask[0].parentNode ) {
        scrollMask[0].parentNode.removeChild(scrollMask[0]);
      }
    };
  }
  private disableBodyScroll = (): Function => {

    const documentElement: HTMLElement = document.documentElement;
    const prevDocumentStyle = documentElement.style.cssText || '';
    const prevBodyStyle = this.body.style.cssText || '';

    const viewportTop = this.$mdUtil.getViewportTop();
    const clientWidth = this.body.clientWidth;
    const hasVerticalScrollbar = this.body.scrollHeight > this.body.clientHeight + 1;

    // Scroll may be set on <html> element (for example by overflow-y: scroll)
    // but Chrome is reporting the scrollTop position always on <body>.
    // scrollElement will allow to restore the scrollTop position to proper target.
    const scrollElement = documentElement.scrollTop > 0 ? documentElement : this.body;

    if (hasVerticalScrollbar) {
      ng.element(this.body).css({
        position: 'fixed',
        width: '100%',
        top: -viewportTop + 'px'
      });
    }
    if (this.body.clientWidth < clientWidth) {
      this.body.style.overflow = 'hidden';
    }
    return function restoreScroll() {
      // Reset the inline style CSS to the previous.
      this.body.style.cssText = prevBodyStyle;
      documentElement.style.cssText = prevDocumentStyle;
      // The scroll position while being fixed
      scrollElement.scrollTop = viewportTop;
    };
  }
  public disableScrollAround = (element?: JQLite | HTMLElement, parent?: JQLite | HTMLElement, options?: any) => {
    this.element = ng.element(parent || this.body);
    this.options = options || {disableScrollMask: false};
    this.count = Math.max(0, this.count || 0);
    if (++this.count === 1) {
      this.restore = [...[this.disableElementScroll()], ...[this.disableBodyScroll()]];
    }
    return () => {
      if (--this.count <= 0) {
        this.restore.map((func: Function) => func.apply(this));
      }
    };
  }
}
