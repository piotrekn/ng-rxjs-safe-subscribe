import { OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

/**
 * Class is using Angular features but is not decorated. Please add an explicit Angular decorator
 */
export abstract class RxjsOnDestroy implements OnDestroy {
  protected readonly destroySubscription = new Subscription();
  protected readonly destroy$ = new Subject<void>();

  // eslint-disable-next-line no-empty-function
  constructor(protected readonly ngOnDestroyPostActionFunction?: () => void) {}

  ngOnDestroy() {
    this.destroySubscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();

    if (this.ngOnDestroyPostActionFunction != null) {
      this.ngOnDestroyPostActionFunction();
    }
  }
}
