import { Subject } from 'rxjs';
import './observable.extension';
import { RxjsOnDestroy } from './rxjs-on-destroy';


test('It should be destroyed', () => {
  const component = new TestComponent();

  let count = 0;
  const subject = new Subject<number>();
  subject.safeSubscribe(component, () => {
    count++;
  });

  // start point
  expect(component.destroySpy).toBeCalledTimes(0);
  expect(count).toBe(0);

  // simulate observable value
  subject.next(10);
  expect(count).toBe(1);

  // destroy parent and cancel observable
  component.ngOnDestroy();
  expect(component.destroySpy).toBeCalledTimes(1);

  // next value should not be triggered
  subject.next(10);
  expect(count).toBe(1);
});

class TestComponent extends RxjsOnDestroy {
  destroySpy = jest.spyOn(this.destroy$, 'next');
}
