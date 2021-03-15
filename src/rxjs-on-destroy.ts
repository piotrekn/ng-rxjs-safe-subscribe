import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive()
export abstract class RxjsOnDestroy implements OnDestroy {
  protected destroySubscribtion = new Subscription();

  ngOnDestroy() {
    this.destroySubscribtion.unsubscribe();
  }
}
