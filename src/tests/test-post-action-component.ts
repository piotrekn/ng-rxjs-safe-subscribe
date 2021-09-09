import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RxjsOnDestroy } from '../rxjs-on-destroy';

export class TestPostActionComponent extends RxjsOnDestroy {
  order: string[] = [];

  get exposedDestroy$(): Observable<boolean> {
    return this.destroy$.pipe(tap(() => this.order.push('ngOnDestroy')));
  }

  override ngOnDestroyPostAction() {
    this.order.push('ngOnPostDestroy');
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.order.push('override ngOnDestroy');
  }
}
