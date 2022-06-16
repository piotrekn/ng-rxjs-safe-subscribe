import { merge, Observable, of, Subject } from 'rxjs';
import { map, shareReplay, tap, toArray } from 'rxjs/operators';
import '../observable.extension';
import { RxjsOnDestroy } from '../rxjs-on-destroy';
import { Counter } from './counter';
import { TestComponent } from './test.component';
import { UntilTestComponent } from './until-test.component';

describe('RxjsOnDestroy', () => {
  let counter: Counter;
  let subject: Subject<void>;

  beforeEach(() => {
    counter = new Counter();
    subject = new Subject<void>();
  });

  describe('subscribeSafely', () => {
    let component: TestComponent;

    beforeEach(() => {
      component = new TestComponent();
    });

    it('should call complete callback ', () => {
      subject.subscribeSafely(
        component,
        () => counter.increment(),
        () => {},
        () => counter.increment(),
      );

      testSubscribeSafely(subject, counter, component, true);
    });

    it('should call complete callback with Partial<Observer<T> overload', () => {
      subject.subscribeSafely(component, {
        next: () => counter.increment(),
        error: () => {},
        complete: () => counter.increment(),
      });

      testSubscribeSafely(subject, counter, component, true);
    });

    it('should call error callback', () => {
      const nextCounter = new Counter();
      const errorCounter = new Counter();
      const subject = new Subject<boolean>();
      const action = (subject: Observable<boolean>) => {
        subject.subscribeSafely(
          component,
          () => nextCounter.increment(),
          () => errorCounter.increment(),
          () => {},
        );
      };

      expectErrorCallbackToBeCalled(action, subject, counter, nextCounter, errorCounter);
    });

    it('should call error callback with Partial<Observer<T> overload', () => {
      const nextCounter = new Counter();
      const errorCounter = new Counter();
      const subject = new Subject<boolean>();
      const action = (subject: Observable<boolean>) => {
        subject.subscribeSafely(component, {
          next: () => nextCounter.increment(),
          error: () => errorCounter.increment(),
          complete: () => {},
        });
      };

      expectErrorCallbackToBeCalled(action, subject, counter, nextCounter, errorCounter);
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

      testSubscribeSafely(subject, counter, component);
    });

    it('should work with shareReplay', () => {
      subject.pipe(shareReplay()).subscribeSafely(component, () => counter.increment());

      testSubscribeSafely(subject, counter, component);
    });

    it('should not unsubscribe other subscriptions ', () => {
      const counter2 = new Counter();

      const observable = subject.pipe(shareReplay());

      observable.subscribeSafely(component, () => counter.increment());

      observable.subscribe(() => {
        counter2.increment();
      });

      testSubscribeSafely(subject, counter, component);

      expect(counter2.count).toBe(3);
      expect(counter.count).toBe(2);
      subject.next();

      expect(counter2.count).toBe(4);
      expect(counter.count).toBe(2);
    });

    it('should work with shareReplay', () => {
      subject.pipe(shareReplay()).subscribeSafely(component, () => counter.increment());

      testSubscribeSafely(subject, counter, component);
    });

    it('should work with "count"', () => {
      subject.subscribeSafely(component, () => counter.increment());

      testSubscribeSafely(subject, counter, component);
    });

    it('should work with "toArray"', () => {
      subject
        .pipe(
          toArray(),
          map((x) => x.length),
        )
        .subscribeSafely(component, (n) => counter.assign(n));

      testSubscribeSafelyWhenCompleted(subject, counter, component);
    });
  });

  describe('subscribeUntil', () => {
    let component: UntilTestComponent;

    beforeEach(() => {
      component = new UntilTestComponent();
    });

    it('should call complete callback ', () => {
      subject.subscribeUntil(
        component.destroyExposed$,
        () => counter.increment(),
        () => {},
        () => counter.increment(),
      );

      testSubscribeSafelyUntil(component.destroySpy, subject, counter, component, true);
    });

    it('should call complete callback with Partial<Observer<T> overload', () => {
      subject.subscribeUntil(component.destroyExposed$, {
        next: () => counter.increment(),
        error: () => {},
        complete: () => counter.increment(),
      });

      testSubscribeSafelyUntil(component.destroySpy, subject, counter, component, true);
    });

    it('should call error callback', () => {
      const nextCounter = new Counter();
      const errorCounter = new Counter();
      const subject = new Subject<boolean>();
      const action = (subject: Observable<boolean>) => {
        subject.subscribeUntil(
          component.destroyExposed$,
          () => nextCounter.increment(),
          () => errorCounter.increment(),
          () => {},
        );
      };

      expectErrorCallbackToBeCalled(action, subject, counter, nextCounter, errorCounter);
    });

    it('should call error callback with Partial<Observer<T> overload', () => {
      const nextCounter = new Counter();
      const errorCounter = new Counter();
      const subject = new Subject<boolean>();
      const action = (subject: Observable<boolean>) => {
        subject.subscribeUntil(component.destroyExposed$, {
          next: () => nextCounter.increment(),
          error: () => errorCounter.increment(),
          complete: () => {},
        });
      };

      expectErrorCallbackToBeCalled(action, subject, counter, nextCounter, errorCounter);
    });

    it('should unsubscribe using passed observable', () => {
      const cancel$ = new Subject<void>();
      const destroy$ = new Subject<void>();
      const stop$ = merge(cancel$, destroy$);

      expect(counter.count).toBe(0);
      subject.subscribeUntil(stop$, () => (counter.count += 1));
      subject.subscribeUntil(destroy$, () => (counter.count += 10));

      subject.next();
      expect(counter.count).toBe(11);

      cancel$.next();
      subject.next();
      expect(counter.count).toBe(21);

      destroy$.next();
      subject.next();
      expect(counter.count).toBe(21);
    });

    it('should unsubscribe', () => {
      subject.subscribeUntil(component.destroyExposed$, () => counter.increment());

      testSubscribeSafelyUntil(component.destroySpy, subject, counter, component);
    });

    it('should work with shareReplay', () => {
      subject.pipe(shareReplay()).subscribeUntil(component.destroyExposed$, () => counter.increment());

      testSubscribeSafelyUntil(component.destroySpy, subject, counter, component);
    });

    it('should not unsubscribe other subscriptions ', () => {
      const counter2 = new Counter();

      const observable = subject.pipe(shareReplay());

      observable.subscribeUntil(component.destroyExposed$, () => counter.increment());

      observable.subscribe(() => counter2.increment());

      testSubscribeSafelyUntil(component.destroySpy, subject, counter, component);

      expect(counter2.count).toBe(3);
      expect(counter.count).toBe(2);
      subject.next();

      expect(counter2.count).toBe(4);
      expect(counter.count).toBe(2);
    });

    it('should work with shareReplay', () => {
      subject.pipe(shareReplay()).subscribeUntil(component.destroyExposed$, () => counter.increment());

      testSubscribeSafelyUntil(component.destroySpy, subject, counter, component);
    });

    it('should work with "count"', () => {
      subject.subscribeUntil(component.destroyExposed$, () => counter.increment());

      testSubscribeSafely(subject, counter, component);
    });

    it('should work with "toArray"', () => {
      subject
        .pipe(
          toArray(),
          map((x) => x.length),
        )
        .subscribeUntil(component.destroyExposed$, (n: number) => counter.assign(n));

      testSubscribeSafelyWhenCompleted(subject, counter, component);
    });
  });
});

function expectErrorCallbackToBeCalled(
  action: (subject: Observable<boolean>) => void,
  subject: Subject<boolean>,
  counter: Counter,
  nextCounter: Counter,
  errorCounter: Counter,
) {
  action(
    subject.pipe(
      tap((shouldThrow) => {
        if (shouldThrow) {
          throw new Error();
        }
      }),
    ),
  );
  expect(counter.count).toBe(0);

  subject.next(false);
  expect(nextCounter.count).toBe(1);
  expect(errorCounter.count).toBe(0);

  subject.next(true);
  expect(nextCounter.count).toBe(1);
  expect(errorCounter.count).toBe(1);

  subject.complete();
  expect(nextCounter.count).toBe(1);
  expect(errorCounter.count).toBe(1);
}

function testSubscribeSafely(
  subject: Subject<void>,
  counter: Counter,
  component: RxjsOnDestroy,
  isIncrementedOnComplete = false,
) {
  // start point
  expect(counter.count).toBe(0);

  // simulate observable value
  subject.next();
  subject.next();
  expect(counter.count).toBe(2);
  if (isIncrementedOnComplete) {
    subject.complete();
  }

  // destroy parent and cancel observable
  component.ngOnDestroy();

  // next value should not be triggered
  subject.next();
  expect(counter.count).toBe(2 + (isIncrementedOnComplete ? 1 : 0));
}

function testSubscribeSafelyUntil(
  destroySpy: jest.SpyInstance<void, [value?: void]>,
  subject: Subject<void>,
  counter: Counter,
  component: RxjsOnDestroy,
  incrementOnComplete = false,
) {
  expect(destroySpy).toBeCalledTimes(0);
  testSubscribeSafely(subject, counter, component, incrementOnComplete);
  expect(destroySpy).toBeCalledTimes(1);
}

function testSubscribeSafelyWhenCompleted(subject: Subject<void>, counter: Counter, component: RxjsOnDestroy) {
  // start point
  expect(counter.count).toBe(0);

  // simulate observable value
  subject.next();
  subject.next();
  expect(counter.count).toBe(0);

  subject.complete();

  // destroy parent and cancel observable
  component.ngOnDestroy();

  // next value should not be triggered
  expect(counter.count).toBe(2);
  subject.next();
  expect(counter.count).toBe(2);
}
