import { Observable, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RxjsOnDestroy } from './rxjs-on-destroy';

function subscribeSafely<T>(
  this: Observable<T>,
  classRef: RxjsOnDestroy,
  next?: (value: T) => void,
  error?: (error: any) => void,
  complete?: () => void,
): Subscription {
  if (typeof classRef !== 'object') {
    throw new Error(`Pass 'this' or other '${RxjsOnDestroy.constructor.name}' object`);
  }

  // tslint:disable-next-line: no-string-literal
  if (typeof classRef.ngOnDestroy !== 'function' || classRef['destroySubscribtion'] == null) {
    throw Error(
      `${classRef.constructor.name} - missing NgOnDestroy function, extend from ${RxjsOnDestroy.constructor.name}`,
    );
  }

  const subscribtion = this.subscribe(next, error, complete);
  // tslint:disable-next-line: no-string-literal
  classRef['destroySubscribtion'].add(subscribtion);
  return subscribtion;
}

function subscribeUntil<T>(
  this: Observable<T>,
  unsubscribeToken: Observable<any>,
  next?: (value: T) => void,
  error?: (error: any) => void,
  complete?: () => void,
): Subscription {
  if (typeof unsubscribeToken !== 'object') {
    throw new Error(`Token cannot be null. Consider using '${subscribeSafely.name}' instead.`);
  }

  // tslint:disable-next-line: no-string-literal
  if (typeof unsubscribeToken.subscribe !== 'function') {
    throw Error(`Is '${unsubscribeToken.constructor.name}' value passed really the Observable or Subject?`);
  }

  // tslint:disable-next-line: no-string-literal
  return this.pipe(takeUntil(unsubscribeToken)).subscribe(next, error, complete);
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
      next?: (value: T) => void,
      error?: (error: any) => void,
      complete?: () => void,
    ): Subscription;
  }
}

Observable.prototype.safeSubscribe = subscribeSafely;
Observable.prototype.subscribeSafely = subscribeSafely;
Observable.prototype.subscribeUntil = subscribeUntil;
