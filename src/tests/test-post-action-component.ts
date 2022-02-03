import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RxjsOnDestroy } from '../rxjs-on-destroy';

export class TestPostActionComponent extends RxjsOnDestroy {
  order: string[] = [];

  constructor() {
    super(() => this.constructorAction());
  }

  get exposedDestroy$(): Observable<void> {
    return this.destroy$.pipe(tap(() => this.order.push('ngOnDestroy')));
  }

  override ngOnDestroyPostAction() {
    this.order.push('ngOnDestroyPostAction');
  }

  private constructorAction() {
    this.order.push('constructorAction');
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.order.push('override ngOnDestroy');
  }
}
