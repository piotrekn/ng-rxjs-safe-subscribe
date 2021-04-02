import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * Class is using Angular features but is not decorated. Please add an explicit Angular decorator.
 * But I had issues as of 11 as LTS.
 */
export abstract class RxjsOnDestroy implements OnDestroy {
  protected destroySubscription = new Subscription();

  ngOnDestroy() {
    this.destroySubscription.unsubscribe();
  }
}
