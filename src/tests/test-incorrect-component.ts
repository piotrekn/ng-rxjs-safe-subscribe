import { RxjsOnDestroy } from '../rxjs-on-destroy';

export class TestIncorrectComponent extends RxjsOnDestroy {
  hasLocalNgOnDestroyExecuted?: boolean;

  override ngOnDestroy() {
    // ups, forgot to call super.ngOnDestroy();
    this.hasLocalNgOnDestroyExecuted = true;
  }
}
