import { Subject } from 'rxjs';
import '../observable.extension';
import { Counter } from './counter';
import { TestIncorrectComponent } from './test-incorrect-component';
import { TestPostActionComponent } from './test-post-action-component';

describe('RxjsOnDestroy', () => {
  let counter: Counter;
  let subject: Subject<void>;

  beforeEach(() => {
    counter = new Counter();
    subject = new Subject<void>();
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

    subject.next();
    component.ngOnDestroy();
    subject.next();

    expect(component.order).toStrictEqual(expectedExecutionOrder);
    expect(counter.count).toBe(1);
  });

  it('should fail to unsubscribe, when overriding ngOnDestroy is missing super.ngOnDestroy()', () => {
    const component = new TestIncorrectComponent();
    subject.subscribeSafely(component, () => counter.increment());

    subject.next();
    component.ngOnDestroy();
    subject.next();

    expect(component.hasLocalNgOnDestroyExecuted).toBeTruthy();
    expect(counter.count).toBe(2); // not 1 unfortunately
  });
});
