import { Observable, Observer, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RxjsOnDestroy } from './rxjs-on-destroy';

function subscribeSafely<T>(
  this: Observable<T>,
  classRef: RxjsOnDestroy,
  observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
  error?: ((err: any) => void) | null,
  complete?: (() => void) | null,
): Subscription {
  if (typeof classRef !== 'object') {
    throw new Error(`Pass 'this' or other '${RxjsOnDestroy.constructor.name}' object`);
  }

  // eslint-disable-next-line dot-notation, @typescript-eslint/dot-notation
  if (typeof classRef.ngOnDestroy !== 'function' || classRef['destroySubscription'] == null) {
    throw Error(
      `${classRef.constructor.name} - missing NgOnDestroy function, extend from ${RxjsOnDestroy.constructor.name}`,
    );
  }

  // TODO The underlying function is actually a Union type. This line may change in v8
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const subscription = this.subscribe(observerOrNext as any, error, complete);

  // eslint-disable-next-line dot-notation, @typescript-eslint/dot-notation
  classRef['destroySubscription'].add(subscription);
  return subscription;
}

function subscribeUntil<T>(
  this: Observable<T>,
  unsubscribeToken: Observable<any>,
  observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
  error?: ((err: any) => void) | null,
  complete?: (() => void) | null,
): Subscription {
  if (typeof unsubscribeToken !== 'object') {
    throw new Error(`Token cannot be null. Consider using '${subscribeSafely.name}' instead.`);
  }

  // tslint:disable-next-line: no-string-literal
  if (typeof unsubscribeToken.subscribe !== 'function') {
    throw Error(`Is '${unsubscribeToken.constructor.name}' value passed really the Observable or Subject?`);
  }

  // TODO The underlying function is actually a Union type. This line may change in v8
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return this.pipe(takeUntil(unsubscribeToken)).subscribe(observerOrNext as any, error, complete);
}

declare module 'rxjs/internal/Observable' {
  // eslint-disable-next-line no-shadow
  interface Observable<T> {
    /** @deprecated it'll be removed in future updates. Use subscribeSafely alias */
    safeSubscribe(
      this: Observable<T>,
      classRef: RxjsOnDestroy,
      next?: ((value: T) => void) | undefined,
      error?: ((err: any) => void) | undefined,
      complete?: (() => void) | undefined,
    ): Subscription;
    subscribeSafely(this: Observable<T>, classRef: RxjsOnDestroy, observer?: Partial<Observer<T>>): Subscription;
    subscribeSafely(this: Observable<T>, classRef: RxjsOnDestroy, next: (value: T) => void): Subscription;
    /** @deprecated Instead of passing separate callback arguments, use an observer argument. Signatures taking separate callback arguments will be removed in rxjs v8. Details: https://rxjs.dev/deprecations/subscribe-arguments */
    subscribeSafely(
      this: Observable<T>,
      classRef: RxjsOnDestroy,
      next?: ((value: T) => void) | undefined,
      error?: ((err: any) => void) | undefined,
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
      error?: ((err: any) => void) | undefined,
      complete?: (() => void) | undefined,
    ): Subscription;
  }
}

Observable.prototype.subscribeSafely = subscribeSafely;
Observable.prototype.subscribeUntil = subscribeUntil;
