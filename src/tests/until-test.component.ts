import { Subject } from 'rxjs';
import { RxjsOnDestroy } from '../rxjs-on-destroy';

export class UntilTestComponent extends RxjsOnDestroy {
  destroy$ = new Subject<boolean>();
  destroySpy = jest.spyOn(this.destroy$, 'next');

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
