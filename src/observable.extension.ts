import { Observable, Observer, Subscriber, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RxjsOnDestroy } from './rxjs-on-destroy';

function subscribeSafely<T>(
  this: Observable<T>,
  classRef: RxjsOnDestroy,
  observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
  error?: ((error: any) => void) | null,
  complete?: (() => void) | null,
): Subscription {
  if (typeof classRef !== 'object') {
    throw new Error(`Pass 'this' or other '${RxjsOnDestroy.constructor.name}' object`);
  }

  // tslint:disable-next-line: no-string-literal
  if (typeof classRef.ngOnDestroy !== 'function' || classRef['destroySubscription'] == null) {
    throw Error(
      `${classRef.constructor.name} - missing NgOnDestroy function, extend from ${RxjsOnDestroy.constructor.name}`,
    );
  }

  const partialObservable = isObserver<T>(observerOrNext) ? observerOrNext : { error, complete, next: observerOrNext };
  const subscription = this.subscribe(partialObservable as Subscriber<T>);

  // tslint:disable-next-line: no-string-literal
  classRef['destroySubscription'].add(subscription);
  return subscription;
}

function subscribeUntil<T>(
  this: Observable<T>,
  unsubscribeToken: Observable<any>,
  observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
  error?: ((error: any) => void) | null,
  complete?: (() => void) | null,
): Subscription {
  if (typeof unsubscribeToken !== 'object') {
    throw new Error(`Token cannot be null. Consider using '${subscribeSafely.name}' instead.`);
  }

  // tslint:disable-next-line: no-string-literal
  if (typeof unsubscribeToken.subscribe !== 'function') {
    throw Error(`Is '${unsubscribeToken.constructor.name}' value passed really the Observable or Subject?`);
  }

  const partialObservable = isObserver<T>(observerOrNext) ? observerOrNext : { error, complete, next: observerOrNext };

  // tslint:disable-next-line: no-string-literal
  return this.pipe(takeUntil(unsubscribeToken)).subscribe(partialObservable as Subscriber<T>);
}

function isObserver<T>(value: any): value is Observer<T> {
  return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
}

function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function';
}

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    /** @deprecated it'll be removed in future updates. Use subscribeSafely alias */
    safeSubscribe(
      this: Observable<T>,
      classRef: RxjsOnDestroy,
      next?: ((value: T) => void) | undefined,
      error?: ((error: any) => void) | undefined,
      complete?: (() => void) | undefined,
    ): Subscription;
    subscribeSafely(this: Observable<T>, classRef: RxjsOnDestroy, observer?: Partial<Observer<T>>): Subscription;
    subscribeSafely(this: Observable<T>, classRef: RxjsOnDestroy, next: (value: T) => void): Subscription;
    /** @deprecated Instead of passing separate callback arguments, use an observer argument. Signatures taking separate callback arguments will be removed in rxjs v8. Details: https://rxjs.dev/deprecations/subscribe-arguments */
    subscribeSafely(
      this: Observable<T>,
      classRef: RxjsOnDestroy,
      next?: ((value: T) => void) | undefined,
      error?: ((error: any) => void) | undefined,
      complete?: (() => void) | undefined,
    ): Subscription;
    subscribeUntil(
      this: Observable<T>,
      unsubscribeToken: Observable<any>,
      observer?: Partial<Observer<T>>,
    ): Subscription;
    subscribeUntil(this: Observable<T>, unsubscribeToken: Observable<any>, next: (value: T) => void): Subscription;
    /** @deprecated Instead of passing separate callback arguments, use an observer argument. Signatures taking separate callback arguments will be removed in rxjs v8. Details: https://rxjs.dev/deprecations/subscribe-arguments */
    subscribeUntil(
      this: Observable<T>,
      unsubscribeToken: Observable<any>,
      next?: ((value: T) => void) | undefined,
      error?: ((error: any) => void) | undefined,
      complete?: (() => void) | undefined,
    ): Subscription;
  }
}

Observable.prototype.subscribeSafely = subscribeSafely;
Observable.prototype.subscribeUntil = subscribeUntil;
