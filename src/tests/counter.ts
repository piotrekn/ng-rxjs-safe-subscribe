export class Counter {
  private value = 0;

  public get count() {
    return this.value;
  }
  public set count(n: number) {
    this.value = n;
  }

  increment() {
    this.value++;
  }

  assign(n: number) {
    this.count = n;
  }
}
