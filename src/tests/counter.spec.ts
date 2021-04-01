import '../observable.extension';
import { Counter } from './counter';

describe('Counter', () => {
  it('should increment', () => {
    const counter = new Counter();
    expect(counter.count).toBe(0);

    counter.increment();
    expect(counter.count).toBe(1);

    counter.increment();
    expect(counter.count).toBe(2);
  });

  it('should increment', () => {
    const counter = new Counter();
    expect(counter.count).toBe(0);

    counter.assign(99);
    expect(counter.count).toBe(99);
  });
});
