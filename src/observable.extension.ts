import { Observable, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RxjsOnDestroy } from './rxjs-on-destroy';

export function safeSubscribe<T>(
  this: any,
  classRef: RxjsOnDestroy,
  next?: (value: T) => void,
  error?: (error: any) => void,
  complete?: () => void,
): Subscription {
  if (typeof classRef !== 'object') {
    throw new Error(`Pass 'this' or other '${RxjsOnDestroy.constructor.name}' object`);
  }

  // tslint:disable-next-line: no-string-literal
  if (typeof classRef.ngOnDestroy !== 'function' || classRef['destroy$'] == null) {
    throw Error(
      `${classRef.constructor.name} - missing NgOnDestroy function, extend from ${RxjsOnDestroy.constructor.name}`,
    );
  }

  // tslint:disable-next-line: no-string-literal
  return this.pipe(takeUntil(classRef['destroy$'])).subscribe(next, error, complete);
}

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    safeSubscribe: typeof safeSubscribe;
  }
}

Observable.prototype.safeSubscribe = safeSubscribe;
