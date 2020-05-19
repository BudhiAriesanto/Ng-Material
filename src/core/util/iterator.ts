import * as ng from 'angular';

export class MdIterator {
  private _items: Array<any>;
  public next = ng.bind(null, this.findSubsequentItem, false);
  public previous = ng.bind(null, this.findSubsequentItem, true);
  constructor(items: Array<any>, private reloop: boolean = false) {
    if (items && !ng.isArray(items)) {
      items = Array.prototype.slice.call(items);

    }
    reloop = !!reloop;
    this._items = items || [];
  }
  public items() {
    return [].concat(this._items);
  }
  public count() {
    return this._items.length;
  }
  /**
   * Get the zero-based index of the target item
   * @param item
   * @returns {*}
   */
  public indexOf(item: any) {
    return this._items.indexOf(item);
  }

  /**
   * Is the index specified valid
   * @param index
   * @returns {Array.length|*|number|boolean}
   */
  public inRange(index: number) {
    return this._items.length && ( index > -1 ) && (index < this._items.length );
  }

  /**
   * Get item at specified index/position
   * @param index
   * @returns {*}
   */
  public itemAt(index: number) {
    return this.inRange(index) ? this._items[index] : null;
  }
  /**
   * Find all elements matching the key/value pair
   * otherwise return null
   *
   * @param val
   * @param key
   *
   * @return array
   */
  public findBy(key: any, val: any) {
    return this._items.filter(function(item: string) {
      return item[key] === val;
    });
  }
  /**
   * Add item to list
   * @param item
   * @param index
   * @returns {*}
   */
  public add(item: any, index: any) {
    if ( !item ) { return -1; }
    if (!ng.isNumber(index)) {
      index = this._items.length;
    }
    this._items.splice(index, 0, item);
    return this.indexOf(item);
  }
  /**
   * Boolean existence check
   * @param item
   * @returns {boolean}
   */
  public contains(item: any) {
    return item && (this.indexOf(item) > -1);
  }
  /**
   * Remove item from list...
   * @param item
   */
  public remove(item: any) {
    if ( this.contains(item) ) {
      this._items.splice(this.indexOf(item), 1);
    }
  }
  /**
   * Return first item in the list
   * @returns {*}
   */
  public first() {
    return this._items.length ? this._items[0] : null;
  }
  /**
   * Return last item in the list...
   * @returns {*}
   */
  public last() {
    return this._items.length ? this._items[this._items.length - 1] : null;
  }
  /**
   * Find the next item. If reloop is true and at the end of the list, it will go back to the
   * first item. If given, the `validate` callback will be used to determine whether the next item
   * is valid. If not valid, it will try to find the next item again.
   *
   * @param {boolean} backwards Specifies the direction of searching (forwards/backwards)
   * @param {*} item The item whose subsequent item we are looking for
   * @param {Function=} validate The `validate` function
   * @param {integer=} limit The recursion limit
   *
   * @returns {*} The subsequent item or null
   */
  private findSubsequentItem(backwards: boolean, item: any, validate: Function, limit: number) {
    validate = validate || ((val?: any) => true);


    let curIndex = this.indexOf(item);
    while (true) {
      if (!this.inRange(curIndex)) { return null; }

      let nextIndex = curIndex + (backwards ? -1 : 1);
      let foundItem = null;
      if (this.inRange(nextIndex)) {
        foundItem = this._items[nextIndex];
      } else if (this.reloop) {
        foundItem = backwards ? this.last() : this.first();
        nextIndex = this.indexOf(foundItem);
      }

      if ((foundItem === null) || (nextIndex === limit)) { return null; }
      if (validate(foundItem)) { return foundItem; }

      if (ng.isUndefined(limit)) { limit = nextIndex; }

      curIndex = nextIndex;
    }
  }
  /**
   * Can the iterator proceed to the previous item in the list; relative to
   * the specified item.
   *
   * @param item
   * @returns {Array.length|*|number|boolean}
   */
  public hasPrevious(item: any): any {
    return item ? this.inRange(this.indexOf(item) - 1) : false;
  }
  /**
   * Can the iterator proceed to the next item in the list; relative to
   * the specified item.
   *
   * @param item
   * @returns {Array.length|*|number|boolean}
   */
  public hasNext(item: any): any {
    return item ? this.inRange(this.indexOf(item) + 1) : false;
  }
}
