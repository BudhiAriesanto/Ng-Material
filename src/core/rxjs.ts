import * as ng from 'angular';
import { Observable, Subscriber, TeardownLogic, SchedulerLike, MonoTypeOperatorFunction, OperatorFunction, ObservableInput, ObservedValueOf, fromEvent, from, merge, of, empty, interval, combineLatest, forkJoin, SubscribableOrPromise, timer } from 'rxjs';
import {delay, filter, map, throttleTime, tap, concatMap, concatMapTo, mergeMap, take, catchError, finalize, last, first, expand, debounce, debounceTime, buffer, bufferCount, bufferTime, timeout} from 'rxjs/operators';
import { ThrottleConfig } from 'rxjs/internal/operators/throttle';
import { FromEventTarget } from 'rxjs/internal/observable/fromEvent';

export interface IObserveable<T> extends Observable<T> {}
export interface ISubscriber<T> extends Subscriber<T> {}
export interface IRxJsOperator {
  delay<T>(delay: number | Date, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
  filter<T, S extends T>(predicate: (value: T, index: number) => value is S, thisArg?: any): OperatorFunction<T, S>;
  filter<T>(predicate: (value: T, index: number) => boolean, thisArg?: any): MonoTypeOperatorFunction<T>;
  map<T, R>(project: (value: T, index: number) => R, thisArg?: any): OperatorFunction<T, R>;
  throttleTime<T>(duration: number, scheduler?: SchedulerLike, config?: ThrottleConfig): MonoTypeOperatorFunction<T>;
  tap<T>(next: null | undefined, error: null | undefined, complete: () => void): MonoTypeOperatorFunction<T>;
  concatMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>;
  concatMapTo<T, O extends ObservableInput<any>>(observable: O): OperatorFunction<T, ObservedValueOf<O>>;
  mergeMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, concurrent?: number): OperatorFunction<T, ObservedValueOf<O>>;
  take<T>(count: number): MonoTypeOperatorFunction<T>;
  catchError<T, O extends ObservableInput<any>>(selector: (err: any, caught: Observable<T>) => O): OperatorFunction<T, T | ObservedValueOf<O>>;
  finalize<T>(callback: () => void): MonoTypeOperatorFunction<T>;
  last<T, D = T>(predicate?: null, defaultValue?: D): OperatorFunction<T, T | D>;
  last<T, S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue?: S): OperatorFunction<T, S>;
  last<T, D = T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): OperatorFunction<T, T | D>;
  first<T, D = T>(predicate?: null, defaultValue?: D): OperatorFunction<T, T | D>;
  first<T, S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue?: S): OperatorFunction<T, S>;
  first<T, D = T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): OperatorFunction<T, T | D>;
  expand<T, R>(project: (value: T, index: number) => ObservableInput<R>, concurrent?: number, scheduler?: SchedulerLike): OperatorFunction<T, R>;
  expand<T>(project: (value: T, index: number) => ObservableInput<T>, concurrent?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
  debounce<T>(durationSelector: (value: T) => SubscribableOrPromise<any>): MonoTypeOperatorFunction<T>;
  debounceTime<T>(dueTime: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
  buffer<T>(closingNotifier: Observable<any>): OperatorFunction<T, T[]>;
  bufferCount<T>(bufferSize: number, startBufferEvery?: number): OperatorFunction<T, T[]>;
  bufferTime<T>(bufferTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
  bufferTime<T>(bufferTimeSpan: number, bufferCreationInterval: number | null | undefined, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
  bufferTime<T>(bufferTimeSpan: number, bufferCreationInterval: number | null | undefined, maxBufferSize: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
  timeout<T>(due: number | Date, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
}
export interface IRxJsService {
  operators: IRxJsOperator;
  Observable<T>(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic): Observable<T>;
  fromEvent<T>(target: FromEventTarget<T>, eventName: string): Observable<T>;
  from<O extends ObservableInput<any>>(input: O, scheduler?: SchedulerLike): Observable<ObservedValueOf<O>>;
  merge<T>(v1: ObservableInput<T>, scheduler?: SchedulerLike): Observable<T>;
  merge<T>(v1: ObservableInput<T>, concurrent?: number, scheduler?: SchedulerLike): Observable<T>;
  merge<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, scheduler?: SchedulerLike): Observable<T | T2>;
  merge<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, concurrent?: number, scheduler?: SchedulerLike): Observable<T | T2>;
  merge<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: SchedulerLike): Observable<T | T2 | T3>;
  merge<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: SchedulerLike): Observable<T | T2 | T3>;
  merge<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, concurrent?: number, scheduler?: SchedulerLike): Observable<T | T2 | T3>;
  merge<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4>;
  merge<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, concurrent?: number, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4>;
  merge<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
  merge<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, concurrent?: number, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
  merge<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;
  merge<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, concurrent?: number, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;
  merge<T>(...observables: (ObservableInput<T> | SchedulerLike | number)[]): Observable<T>;
  merge<T, R>(...observables: (ObservableInput<any> | SchedulerLike | number)[]): Observable<R>;
  of<T>(a: T, scheduler?: SchedulerLike): Observable<T>;
  of<T, T2>(a: T, b: T2, scheduler?: SchedulerLike): Observable<T | T2>;
  of<T, T2, T3>(a: T, b: T2, c: T3, scheduler?: SchedulerLike): Observable<T | T2 | T3>;
  of<T, T2, T3, T4>(a: T, b: T2, c: T3, d: T4, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4>;
  of<T, T2, T3, T4, T5>(a: T, b: T2, c: T3, d: T4, e: T5, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
  of<T, T2, T3, T4, T5, T6>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;
  of<T, T2, T3, T4, T5, T6, T7>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6 | T7>;
  of<T, T2, T3, T4, T5, T6, T7, T8>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7, h: T8, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
  of<T, T2, T3, T4, T5, T6, T7, T8, T9>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7, h: T8, i: T9, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
  of<T>(...args: Array<T | SchedulerLike>): Observable<T>;
  empty(scheduler?: SchedulerLike): Observable<never>;
  interval(period?: number, scheduler?: SchedulerLike): Observable<number>;
  combineLatest<O1 extends ObservableInput<any>>(sources: [O1], scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>]>;
  combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>>(sources: [O1, O2], scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>]>;
  combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>>(sources: [O1, O2, O3], scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>]>;
  combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>>(sources: [O1, O2, O3, O4], scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>]>;
  combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>>(sources: [O1, O2, O3, O4, O5], scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>]>;
  combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, O6 extends ObservableInput<any>>(sources: [O1, O2, O3, O4, O5, O6], scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>, ObservedValueOf<O6>]>;
  combineLatest<O extends ObservableInput<any>>(sources: O[], scheduler?: SchedulerLike): Observable<ObservedValueOf<O>[]>;
  combineLatest<O1 extends ObservableInput<any>>(v1: O1, scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>]>;
  combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>>(v1: O1, v2: O2, scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>]>;
  combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>]>;
  combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, v4: O4, scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>]>;
  combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, v4: O4, v5: O5, scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>]>;
  combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, O6 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, v4: O4, v5: O5, v6: O6, scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>, ObservedValueOf<O6>]>;
  forkJoin<T>(sources: [ObservableInput<T>]): Observable<T[]>;
  forkJoin<T, T2>(sources: [ObservableInput<T>, ObservableInput<T2>]): Observable<[T, T2]>;
  forkJoin<T, T2, T3>(sources: [ObservableInput<T>, ObservableInput<T2>, ObservableInput<T3>]): Observable<[T, T2, T3]>;
  forkJoin<T, T2, T3, T4>(sources: [ObservableInput<T>, ObservableInput<T2>, ObservableInput<T3>, ObservableInput<T4>]): Observable<[T, T2, T3, T4]>;
  forkJoin<T, T2, T3, T4, T5>(sources: [ObservableInput<T>, ObservableInput<T2>, ObservableInput<T3>, ObservableInput<T4>, ObservableInput<T5>]): Observable<[T, T2, T3, T4, T5]>;
  forkJoin<T, T2, T3, T4, T5, T6>(sources: [ObservableInput<T>, ObservableInput<T2>, ObservableInput<T3>, ObservableInput<T4>, ObservableInput<T5>, ObservableInput<T6>]): Observable<[T, T2, T3, T4, T5, T6]>;
  forkJoin<T>(sources: Array<ObservableInput<T>>): Observable<T[]>;
  forkJoin<T>(v1: ObservableInput<T>): Observable<T[]>;
  forkJoin<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>): Observable<[T, T2]>;
  forkJoin<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<[T, T2, T3]>;
  forkJoin<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<[T, T2, T3, T4]>;
  forkJoin<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<[T, T2, T3, T4, T5]>;
  forkJoin<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
  timer(dueTime?: number | Date, periodOrScheduler?: number | SchedulerLike, scheduler?: SchedulerLike): Observable<number>;
}
export interface IScopeWatch {
  newVal: any;
  oldVal: any;
}
export interface IScopeWatchMerge {
  index: number;
  key: string;
  newVal: any;
  oldVal: any;
}

export interface IRootScopeRx extends ng.IRootScopeService {
  $rxWatch(watch: string, equality?: boolean | any[]): IObserveable<IScopeWatch>;
  $rxFromEvent(eventName: string): IObserveable<any>;
  $rxWatchMerge(watch: string | string[]): IObserveable<IScopeWatchMerge>;
}
export class RxJs {
  private RxJSService: IRxJsService;
  static factory = () => {
    return new RxJs().RxJSService;
  }
  constructor() {
    this.RxJSService = ((factory: RxJs) => {
      return {
        operators: {
          delay, filter, map, throttleTime, tap, concatMap, concatMapTo, mergeMap, take, catchError, finalize, last, first, expand, debounce, debounceTime,
          buffer, bufferCount, bufferTime, timeout
        },
        Observable: function<T>(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic) {
          return Observable.create(subscribe);
        }, fromEvent, from, merge, of, empty, interval, combineLatest, forkJoin, timer
      };
    })(this);
  }
}

export const RxJsRootScope = ['$delegate', '$rx', function($delegate: Function | ng.IRootScopeService, $rx: IRxJsService) {
  $delegate.constructor.prototype.$rxWatch = function(watch: string, equality?: boolean): IObserveable<IScopeWatch> {
      equality = equality || false;
      const { Observable } = $rx;
      const obs = Observable((subscribe: ISubscriber<IScopeWatch>) => {
          const listener = (newVal: any, oldVal: any) => {
              subscribe.next({
                  oldVal: oldVal, newVal: newVal
              });
          };
          this.$watch(watch, listener, equality);
          this.$on('$destroy', () => { subscribe.unsubscribe(); });
      });
      return obs;
  };
  $delegate.constructor.prototype.$rxFromEvent = function(eventName: string) {
      const { Observable, from } = $rx;
      const obs = Observable((subscribe: ISubscriber<any[]>) => {
          const listener = (...args: any[]) => {
              subscribe.next(args);
          };
          from(eventName.trim().split(' ')).pipe(
              map(val => {
                  (<any> this)[val] = (...args: any[]) => {
                      args.splice(0, 0, val);
                      listener.apply(this, args);
                  };
                  return val;
              })
          ).subscribe().unsubscribe();
          this.$on('$destroy', () => { subscribe.unsubscribe(); });
      });
      return obs;
  };

  $delegate.constructor.prototype.$rxWatchMerge = function(watch: any) {
      const self: IRootScopeRx = this;
      const { operators, merge } = $rx;
      const { map } = operators;
      let watchArray: Array<string | IObserveable<IScopeWatch>> = (typeof watch === 'string' ? watch.trim().split(' ') : watch );
      watchArray = watchArray.map((key: string, index: number) => {
          return self.$rxWatch(key).pipe(
                  map((val: IScopeWatch) => ng.extend(val, {key: key, index: index}))
              );
          }
      );
      const observeable: IObserveable<IScopeWatchMerge> = merge.apply(self, watchArray);
      self.$on('$destroy', () => {
          observeable.subscribe().unsubscribe();
      });
      return observeable;
  };
  return $delegate;
}];
