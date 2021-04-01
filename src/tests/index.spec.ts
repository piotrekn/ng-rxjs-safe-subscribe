import { of, Subject } from 'rxjs';
import { count, map, shareReplay, toArray } from 'rxjs/operators';
import '../observable.extension';
import { RxjsOnDestroy } from '../rxjs-on-destroy';
import { Counter } from './counter';
import { TestComponent } from './test.component';
import { UntilTestComponent } from './until-test.component';

describe('RxjsOnDestroy', () => {
  let counter: Counter;
  let subject: Subject<number>;

  beforeEach(() => {
    counter = new Counter();
    subject = new Subject<number>();
  });

  describe('safeSubscribe', () => {
    let component: TestComponent;

    beforeEach(() => {
      component = new TestComponent();
    });

    it('should use generic type in subscribe', () => {
      const mockFunction = (_: number) => {};
      of(1).subscribeSafely(component, (n) => {
        mockFunction(n);
      });

      of(1).subscribeUntil(of(true), (n) => {
        mockFunction(n);
      });
      expect.anything();
    });

    it('should unsubscribe', () => {
      subject.subscribeSafely(component, () => counter.increment());

      testSafeSubscribe(subject, counter, component);
    });

    it('should work with shareReplay', () => {
      subject.pipe(shareReplay()).subscribeSafely(component, () => counter.increment());

      testSafeSubscribe(subject, counter, component);
    });

    it('should work not unsubscribe other subscriptions ', () => {
      const counter2 = new Counter();

      const observable = subject.pipe(shareReplay());

      observable.subscribeSafely(component, () => counter.increment());

      observable.subscribe(() => {
        counter2.increment();
      });

      testSafeSubscribe(subject, counter, component);

      expect(counter2.count).toBe(2);
      expect(counter.count).toBe(1);
      subject.next(9);

      expect(counter2.count).toBe(3);
      expect(counter.count).toBe(1);
    });

    it('should work with shareReplay', () => {
      subject.pipe(shareReplay()).subscribeSafely(component, () => counter.increment());

      testSafeSubscribe(subject, counter, component);
    });

    it('should work with "count"', () => {
      subject.pipe(count()).subscribeSafely(component, (n) => counter.assign(n));

      testSafeSubscribeWhenCompleted(subject, counter, component);
    });

    it('should work with "toArray"', () => {
      subject
        .pipe(
          toArray(),
          map((x) => x.length),
        )
        .subscribeSafely(component, (n) => counter.assign(n));

      testSafeSubscribeWhenCompleted(subject, counter, component);
    });
  });

  describe('subscribeUntil', () => {
    let component: UntilTestComponent;

    beforeEach(() => {
      component = new UntilTestComponent();
    });

    it('should unsubscribe', () => {
      subject.subscribeUntil(component.destroy$, () => counter.increment());

      testSafeSubscribeUntil(component.destroySpy, subject, counter, component);
    });

    it('should work with shareReplay', () => {
      subject.pipe(shareReplay()).subscribeUntil(component.destroy$, () => counter.increment());

      testSafeSubscribeUntil(component.destroySpy, subject, counter, component);
    });

    it('should work not unsubscribe other subscriptions ', () => {
      const counter2 = new Counter();

      const observable = subject.pipe(shareReplay());

      observable.subscribeUntil(component.destroy$, () => counter.increment());

      observable.subscribe(() => counter2.increment());

      testSafeSubscribeUntil(component.destroySpy, subject, counter, component);

      expect(counter2.count).toBe(2);
      expect(counter.count).toBe(1);
      subject.next(9);

      expect(counter2.count).toBe(3);
      expect(counter.count).toBe(1);
    });

    it('should work with shareReplay', () => {
      subject.pipe(shareReplay()).subscribeUntil(component.destroy$, () => counter.increment());

      testSafeSubscribeUntil(component.destroySpy, subject, counter, component);
    });

    it('should work with "count"', () => {
      subject.pipe(count()).subscribeUntil(component.destroy$, (n: number) => counter.assign(n));

      testSafeSubscribeWhenCompleted(subject, counter, component);
    });

    it('should work with "toArray"', () => {
      subject
        .pipe(
          toArray(),
          map((x) => x.length),
        )
        .subscribeUntil(component.destroy$, (n: number) => counter.assign(n));

      testSafeSubscribeWhenCompleted(subject, counter, component);
    });
  });
});

function testSafeSubscribe(subject: Subject<number>, counter: Counter, component: RxjsOnDestroy) {
  // start point
  expect(counter.count).toBe(0);

  // simulate observable value
  subject.next(10);
  expect(counter.count).toBe(1);

  // destroy parent and cancel observable
  component.ngOnDestroy();

  // next value should not be triggered
  subject.next(100);
  expect(counter.count).toBe(1);
}

function testSafeSubscribeUntil(destroySpy: any, subject: Subject<number>, counter: Counter, component: RxjsOnDestroy) {
  expect(destroySpy).toBeCalledTimes(0);
  testSafeSubscribe(subject, counter, component);
  expect(destroySpy).toBeCalledTimes(1);
}

function testSafeSubscribeWhenCompleted(subject: Subject<number>, counter: Counter, component: RxjsOnDestroy) {
  // start point
  expect(counter.count).toBe(0);

  // simulate observable value
  subject.next(10);
  subject.next(20);
  expect(counter.count).toBe(0);

  subject.complete();

  // destroy parent and cancel observable
  component.ngOnDestroy();

  // next value should not be triggered
  expect(counter.count).toBe(2);
  subject.next(100);
  expect(counter.count).toBe(2);
}
