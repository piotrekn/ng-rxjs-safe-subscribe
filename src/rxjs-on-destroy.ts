import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive()
export abstract class RxjsOnDestroy implements OnDestroy {
  protected destroySubscription = new Subscription();

  ngOnDestroy() {
    this.destroySubscription.unsubscribe();
  }
}
