import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RxjsOnDestroy } from '../rxjs-on-destroy';

export class TestPostActionComponent extends RxjsOnDestroy {
  order: string[] = [];

  constructor() {
    super(() => this.myNgOnDestroyPostAction());
  }

  get exposedDestroy$(): Observable<boolean> {
    return this.destroy$.pipe(tap(() => this.order.push('ngOnDestroy')));
  }

  override ngOnDestroyPostAction() {
    this.order.push('ngOnPostDestroy');
  }

  private myNgOnDestroyPostAction() {
    this.order.push('myNgOnDestroyPostAction');
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.order.push('override ngOnDestroy');
  }
}
