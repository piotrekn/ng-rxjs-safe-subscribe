import { Subject } from 'rxjs';
import '../observable.extension';
import { Counter } from './counter';
import { TestIncorrectComponent } from './test-incorrect-component';
import { TestPostActionComponent } from './test-post-action-component';

describe('RxjsOnDestroy', () => {
  let counter: Counter;
  let subject: Subject<number>;

  beforeEach(() => {
    counter = new Counter();
    subject = new Subject<number>();
  });

  it('should call ngOnDestroy and post action', () => {
    const expectedExecutionOrder = [
      'ngOnDestroy',
      'constructorAction',
      'ngOnDestroyPostAction',
      'override ngOnDestroy',
    ];
    const component = new TestPostActionComponent();
    subject.subscribeSafely(component, () => counter.increment());
    component.exposedDestroy$.subscribe();

    subject.next(1);
    component.ngOnDestroy();
    subject.next(1);

    expect(component.order).toStrictEqual(expectedExecutionOrder);
    expect(counter.count).toBe(1);
  });

  it('should fail to unsubscribe, when overriding ngOnDestroy is missing super.ngOnDestroy()', () => {
    const component = new TestIncorrectComponent();
    subject.subscribeSafely(component, () => counter.increment());

    subject.next(1);
    component.ngOnDestroy();
    subject.next(1);

    expect(component.hasLocalNgOnDestroyExecuted).toBeTruthy();
    expect(counter.count).toBe(2); // not 1 unfortunately
  });
});
