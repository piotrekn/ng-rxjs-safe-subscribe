import { Subject } from 'rxjs';
import { count, shareReplay, toArray } from 'rxjs/operators';
import './observable.extension';
import { RxjsOnDestroy } from './rxjs-on-destroy';

describe('RxjsOnDestroy', () => {
  it('should unsubscribe', () => {
    const component = new TestComponent();

    const counter = { value: 0 };
    const subject = new Subject<number>();
    subject.safeSubscribe(component, () => {
      counter.value++;
    });

    testSafeSubscribe(subject, counter, component);
  });

  it('should work with shareReplay', () => {
    const component = new TestComponent();

    const counter = { value: 0 };
    const subject = new Subject<number>();
    subject.pipe(shareReplay()).safeSubscribe(component, () => {
      counter.value++;
    });

    testSafeSubscribe(subject, counter, component);
  });

  it('should work not unsubscribe other subscribtions ', () => {
    const component = new TestComponent();

    const counter = { value: 0 };
    const counter2 = { value: 0 };
    const subject = new Subject<number>();

    const observable = subject.pipe(shareReplay());

    observable.safeSubscribe(component, () => {
      counter.value++;
    });

    observable.subscribe(() => {
      counter2.value++;
    });

    testSafeSubscribe(subject, counter, component);

    expect(counter2.value).toBe(2);
    expect(counter.value).toBe(1);
    subject.next(9);

    expect(counter2.value).toBe(3);
    expect(counter.value).toBe(1);
  });

  it('should work with shareReplay', () => {
    const component = new TestComponent();

    const counter = { value: 0 };
    const subject = new Subject<number>();
    subject.pipe(shareReplay()).safeSubscribe(component, () => {
      counter.value++;
    });

    testSafeSubscribe(subject, counter, component);
  });

  it('should work with "count"', () => {
    const component = new TestComponent();

    const counter = { value: 0 };
    const subject = new Subject<number>();

    subject.pipe(count()).safeSubscribe(component, (x: number) => {
      counter.value = x;
    });

    testSafeSubscribeWhenCompleted(subject, counter, component);
  });

  it('should work with "toArray"', () => {
    const component = new TestComponent();

    const counter = { value: 0 };
    const subject = new Subject<number>();

    subject.pipe(toArray()).safeSubscribe(component, (x: number[]) => {
      counter.value = x.length;
    });

    testSafeSubscribeWhenCompleted(subject, counter, component);
  });
});
class TestComponent extends RxjsOnDestroy {
  destroySpy = jest.spyOn(this.destroy$, 'next');
}

function testSafeSubscribe(subject: Subject<number>, counter: { value: number }, component: TestComponent) {
  // start point
  expect(component.destroySpy).toBeCalledTimes(0);
  expect(counter.value).toBe(0);

  // simulate observable value
  subject.next(10);
  expect(counter.value).toBe(1);

  // destroy parent and cancel observable
  component.ngOnDestroy();
  expect(component.destroySpy).toBeCalledTimes(1);

  // next value should not be triggered
  subject.next(100);
  expect(counter.value).toBe(1);
}

function testSafeSubscribeWhenCompleted(
  subject: Subject<number>,
  counter: { value: number },
  component: TestComponent,
) {
  // start point
  expect(counter.value).toBe(0);

  // simulate observable value
  subject.next(10);
  subject.next(20);
  expect(counter.value).toBe(0);

  subject.complete();

  // destroy parent and cancel observable
  component.ngOnDestroy();

  // next value should not be triggered
  expect(counter.value).toBe(2);
  subject.next(100);
  expect(counter.value).toBe(2);
}
