import { RxjsOnDestroy } from '../rxjs-on-destroy';

export class UntilTestComponent extends RxjsOnDestroy {
  destroySpy = jest.spyOn(this.destroy$, 'next');

  get destroyExposed$() {
    return this.destroy$;
  }
}
