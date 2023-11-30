<h1 align="center">ng-rxjs-safe-subscribe</h1>

<p align="center">
Implementation of <a href="https://angular.io/">Angular's</a> repeatable OnDestroy pattern.
</p>

<p align="center">
    <a href="https://badge.fury.io/js/ng-rxjs-safe-subscribe"><img src="https://badge.fury.io/js/ng-rxjs-safe-subscribe.svg" alt="npm version" ></a>
    <a href="https://npmjs.org/ng-rxjs-safe-subscribe"><img src="https://img.shields.io/npm/dm/ng-rxjs-safe-subscribe.svg" alt="npm downloads" ></a>
    <a href="https://wallabyjs.com/oss/"><img src="https://img.shields.io/badge/wallaby.js-powered-blue.svg?style=flat&logo=github" alt="wallaby" ></a>
</p>

# Why do I need it?

Because of the DRY principle. Instead of reimplementing the pattern in every component:

```typescript
export class MyComponent implements OnDestroy {
  private booksSubscription: Subscription;

  getBooks(): void {
    this.booksSubscription = this.booksService.getBooks().subscribe((books) =>
      (...)
    );
  }

  ngOnDestroy(): void {
    this.booksSubscription.unsubscribe();
  }
}
```

simplify the code and just subscribe safely:

```typescript
export class MyComponent extends RxjsOnDestroy {
  getBooks(): void {
    this.booksService.getBooks().subscribeSafely(this, (books) =>
      (...)
    );
  }
}
```

One of the most common mistakes made with RxJS is subscribing to an Observable in a fire-and-forget manner.

A rule of thumb is that a subscriber should unsubscribe when no longer using an observable. If there is no explicit unsubscribe, then those books will be pushed to subscribe function infinitely. While it may not be the case for some observable sources, it can silently become an issue and cause a <i>leaks</i> leading to unwanted behaviors.

There are a few ways to deal with unsubscribing. A direct:

1. calling unsubscribe() directly on subscription.

... or more declarative one using <a href="https://rxjs-dev.firebaseapp.com/guide/overview/">RxJs</a>:

2. using operator: takeUntil, takeWhile (declarative unsubscribe),
3. taking a finite number of values: first, take(n) - it'll unsubscribe after n emits, and only then,
4. async pipe in HTML template - takes care of the issue automagically.

Package `ng-rxjs-safe-subscribe` provides a ready-to-use solution for every Angular project.

# Installation

Install `ng-rxjs-safe-subscribe` from `npm`:

```bash
npm install ng-rxjs-safe-subscribe
```

Import an abstract class:

```typescript
import { RxjsOnDestroy } from 'ng-rxjs-safe-subscribe';
```

Extend the class with `RxjsOnDestroy` that implements the `OnDestroy` hook.

```typescript
export class AppComponent extends RxjsOnDestroy
```

Finally, use one of the following approaches to subscribe in code using `Observable.subscribeSafely` or `Observable.subscribeUntil` function.

## How to execute custom logic at `ngOnDestroy`

Consider passing an arrow function with custom destroy logic to the constructor:

```typescript
    constructor() {
        super(() => this.customDestroy());
    }
```

The `ngOnDestroy` function can be also easily overridden, but be sure to <u>always call the base function</u> for `RxjsOnDestroy` to unsubscribe properly:

```typescript
    override ngOnDestroy(){
        super.ngOnDestroy();

        ...
    }
```

Typescript can help you avoid mistaken overrides with [noImplicitOverride](https://www.typescriptlang.org/tsconfig#noImplicitOverride) rule. It is HIGHLY RECOMMENDED to enable that.

## 1. Unsubscribe with a sink

Subscribe safely, pass an object which extends RxjsOnDestroy abstract class:

```typescript
this.users$.subscribeSafely(rxjsOnDestroyInstance, (x) => console.log(x));
```

Full example:

```typescript
import { Component } from '@angular/core';
import { RxjsOnDestroy } from 'ng-rxjs-safe-subscribe';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent extends RxjsOnDestroy {
  users$: Observable<User[]>;

  constructor(private userService: UserService) {
    super();

    this.users$ = this.userService.getUsers();
    this.users$.subscribeSafely(this, (x) => console.log(x));
  }
}
```

## 2. Declarative unsubscribe

You may pass an observable instance that triggers unsubscribe by passing a value and completion:

```typescript
this.users$.subscribeUntil(this.destroy$, (x) => console.log(x));
```

The example uses `this.destroy$` of `RxjsOnDestroy` class.

Full example:

```typescript
import { Component } from '@angular/core';
import { RxjsOnDestroy } from 'ng-rxjs-safe-subscribe';
import { Observable, fromEvent, merge } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent extends RxjsOnDestroy {
  users$: Observable<User[]>;

  constructor(private userService: UserService) {
    super();

    this.users$ = this.userService.getUsers();

    const cancelBtn = this.element.querySelector('.cancel-button');
    const cancel$ = fromEvent(cancelBtn, 'click');
    const stop$ = merge(cancel$, this.destroy$)

    // will stop when button clicked or component destroyed
    this.users$.subscribeUntil(stop$, (x) => console.log(x));

    // will stop when component destroyed
    this.users$.subscribeUntil(this.destroy$, (x) => console.log(x));
 }
}
```

You can now use stop to kill the subscription in the moment of your choosing, but remember to always unsubscribe on object destruction.

Read up [Ben Lesh's article](https://medium.com/@benlesh/rxjs-dont-unsubscribe-6753ed4fda87) for more on this topic.

# Compatibility

The only two dependencies are [Angular](https://angular.io) and [RxJS](https://rxjs-dev.firebaseapp.com/guide/overview).
Here is the versions compatibility list:

| ng-rxjs-safe-subscribe | Angular | RxJS  |
| ---------------------- | ------- | ----- |
| 17.x.x                 | 17.x.x  | 7.x.x |
| 16.x.x                 | 16.x.x  | 7.x.x |
| 15.x.x                 | 15.x.x  | 7.x.x |
| 14.x.x                 | 14.x.x  | 7.x.x |
| 13.x.x                 | 13.x.x  | 7.x.x |
| 12.x.x                 | 12.x.x  | 6.x.x |
| 11.x.x                 | 11.x.x  | 6.x.x |
| 10.x.x                 | 10.x.x  | 6.x.x |

The package should work with every version of Angular, as long as the RxJS version is matching yours.

# License

[ISC](https://opensource.org/licenses/ISC)
