import { Directive, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Directive()
export abstract class RxjsOnDestroy implements OnDestroy {
  protected destroy$ = new Subject<boolean>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
