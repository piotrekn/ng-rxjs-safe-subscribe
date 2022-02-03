import { OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

/**
 * Class is using Angular features but is not decorated. Please add an explicit Angular decorator
 */
export abstract class RxjsOnDestroy implements OnDestroy {
  protected destroySubscription = new Subscription();
  protected destroy$ = new Subject<void>();

  constructor(protected ngOnDestroyPostActionFunction?: () => void) {}

/**
 * @deprecated The method will be removed. Please use super(() => {...}) instead
 */
  // tslint:disable-next-line: no-empty
  ngOnDestroyPostAction() {}

  ngOnDestroy() {
    this.destroySubscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();

    if (this.ngOnDestroyPostActionFunction != null) {
      this.ngOnDestroyPostActionFunction();
    }
    this.ngOnDestroyPostAction();
  }
}
