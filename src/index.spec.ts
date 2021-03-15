import { Subject } from 'rxjs';
import { count, map, shareReplay, toArray } from 'rxjs/operators';
import './observable.extension';
import { RxjsOnDestroy } from './rxjs-on-destroy';

describe('RxjsOnDestroy', () => {
  let counter: { value: number };
  let subject: Subject<number>;
  beforeEach(() => {
    counter = { value: 0 };
    subject = new Subject<number>();
  });

  function increment() {
    counter.value++;
  }

  function assign(n: number) {
    counter.value = n;
  }

  describe('safeSubscribe', () => {
    let component: TestComponent;

    beforeEach(() => {
      component = new TestComponent();
    });

    it('should unsubscribe', () => {
      subject.subscribeSafely(component, increment);

      testSafeSubscribe(subject, counter, component);
    });

    it('should work with shareReplay', () => {
      subject.pipe(shareReplay()).subscribeSafely(component, increment);

      testSafeSubscribe(subject, counter, component);
    });

    it('should work not unsubscribe other subscribtions ', () => {
      const counter2 = { value: 0 };

      const observable = subject.pipe(shareReplay());

      observable.subscribeSafely(component, increment);

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
      subject.pipe(shareReplay()).subscribeSafely(component, increment);

      testSafeSubscribe(subject, counter, component);
    });

    it('should work with "count"', () => {
      subject.pipe(count()).subscribeSafely(component, assign);

      testSafeSubscribeWhenCompleted(subject, counter, component);
    });

    it('should work with "toArray"', () => {
      subject
        .pipe(
          toArray(),
          map((x) => x.length),
        )
        .subscribeSafely(component, assign);

      testSafeSubscribeWhenCompleted(subject, counter, component);
    });

    class TestComponent extends RxjsOnDestroy {}
  });

  describe('subscribeUntil', () => {
    let component: UntilTestComponent;

    beforeEach(() => {
      component = new UntilTestComponent();
    });

    it('should unsubscribe', () => {
      subject.subscribeUntil(component.destroy$, increment);

      testSafeSubscribeUntil(component.destroySpy, subject, counter, component);
    });

    it('should work with shareReplay', () => {
      subject.pipe(shareReplay()).subscribeUntil(component.destroy$, increment);

      testSafeSubscribeUntil(component.destroySpy, subject, counter, component);
    });

    it('should work not unsubscribe other subscribtions ', () => {
      const counter2 = { value: 0 };

      const observable = subject.pipe(shareReplay());

      observable.subscribeUntil(component.destroy$, increment);

      observable.subscribe(() => {
        counter2.value++;
      });

      testSafeSubscribeUntil(component.destroySpy, subject, counter, component);

      expect(counter2.value).toBe(2);
      expect(counter.value).toBe(1);
      subject.next(9);

      expect(counter2.value).toBe(3);
      expect(counter.value).toBe(1);
    });

    it('should work with shareReplay', () => {
      subject.pipe(shareReplay()).subscribeUntil(component.destroy$, increment);

      testSafeSubscribeUntil(component.destroySpy, subject, counter, component);
    });

    it('should work with "count"', () => {
      subject.pipe(count()).subscribeUntil(component.destroy$, assign);

      testSafeSubscribeWhenCompleted(subject, counter, component);
    });

    it('should work with "toArray"', () => {
      subject
        .pipe(
          toArray(),
          map((x) => x.length),
        )
        .subscribeUntil(component.destroy$, assign);

      testSafeSubscribeWhenCompleted(subject, counter, component);
    });

    // tslint:disable-next-line: max-classes-per-file
    class UntilTestComponent extends RxjsOnDestroy {
      destroy$ = new Subject<boolean>();
      destroySpy = jest.spyOn(this.destroy$, 'next');

      ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
      }
    }
  });
});

function testSafeSubscribe(subject: Subject<number>, counter: { value: number }, component: RxjsOnDestroy) {
  // start point
  expect(counter.value).toBe(0);

  // simulate observable value
  subject.next(10);
  expect(counter.value).toBe(1);

  // destroy parent and cancel observable
  component.ngOnDestroy();

  // next value should not be triggered
  subject.next(100);
  expect(counter.value).toBe(1);
}

function testSafeSubscribeUntil(
  destroySpy: any,
  subject: Subject<number>,
  counter: { value: number },
  component: RxjsOnDestroy,
) {
  expect(destroySpy).toBeCalledTimes(0);
  testSafeSubscribe(subject, counter, component);
  expect(destroySpy).toBeCalledTimes(1);
}

function testSafeSubscribeWhenCompleted(
  subject: Subject<number>,
  counter: { value: number },
  component: RxjsOnDestroy,
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
