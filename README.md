<h1 align="center">ng-rxjs-safe-subscribe</h1>

<p align="center">
Implementation of <a href="https://angular.io/">Angular's</a> repeatable OnDestroy pattern.
</p>

<p align="center">
    <a href="https://badge.fury.io/js/ngx-bootstrap"><img src="https://badge.fury.io/js/ng-rxjs-safe-subscribe.svg" alt="npm version" ></a>
    <a href="https://npmjs.org/ngx-bootstrap"><img src="https://img.shields.io/npm/dm/ng-rxjs-safe-subscribe.svg" alt="npm downloads" ></a>
</p>

# Why do I need it?

Because of DRY principle, for once.

Also, one of the most common mistakes beginners make with RxJs and others may forget to avoid is to subscribe to an Observable in a fire-and-forget manner like so:

```
books$.subscribe(() => doSomething());
```

Rule of thumb is that a subscriber should unsubscribe when no longer using an observable. If there is no explicit unsubscribe, then those books will be pushed to subscribe function infinitely. While it may not be the case for some observable sources, it almost always is. Finally, it causes a <i>leaks</i> leading to unwanted behaviors.

There are few ways to deal with unsubscribe. A direct:

1. calling unsubscribe() directly on subscription.

... or more declarative one using <a href="https://rxjs-dev.firebaseapp.com/guide/overview/">RxJs</a>:

2. using operator: takeUntil, takeWhile (declarative unsubscribe),
3. taking a finite number of values: first, take(n) - it'll unsubscribe after n emits, and only then,
4. async pipe in HTML template - takes care of the issue automagically.

Package `ng-rxjs-safe-subscribe` provides a ready and easy to use solution for your every Angular project.

# Installation instructions

Install `ng-rxjs-safe-subscribe` from `npm`:

```bash
npm install ng-rxjs-safe-subscribe
```

Import an abstract class:

```
import { RxjsOnDestroy } from 'ng-rxjs-safe-subscribe';
```

Extend the class with `RxjsOnDestroy` that implements `OnDestroy` hook.

```
export class AppComponent extends RxjsOnDestroy
```

Finally, use one of the following approaches to subscribe in code using `Observable.subscribeSafely` or `Observable.subscribeUntil` function.

## How to execute custom logic at `ngOnDestroy`

Consider overriding the `ngOnDestroyPostAction()` function to execute a callback function at the very end of the `ngOnDestroy` function.

The `ngOnDestroy` function can be also easily overridden, but be sure to <u>always call the base function</u> for `RxjsOnDestroy` to unsubscribe properly:

```
    override ngOnDestroy(){
        super.ngOnDestroy();

        ...
    }
```

## 1. Unsubscribe with a sink

Subscribe safely, pass object which extends RxjsOnDestroy abstract class:

```
this.users$.subscribeSafely(rxjsOnDestroyInstance, (x) => console.log(x));
```

Full example:

```
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

```
this.users$.subscribeUntil(this.destroy$, (x) => console.log(x));
```

The example uses `this.destroy$` of `RxjsOnDestroy` class.

Full example:

```
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

You can now use stop to kill the subscription in the moment of your choosing, but nonetheless remember to always unsubscribe on object destruction.

Read up [Ben Lesh's article](https://medium.com/@benlesh/rxjs-dont-unsubscribe-6753ed4fda87) for more in this topic.

# Compatibility

The only two dependencies are [Angular](https://angular.io) and [RxJs](https://rxjs-dev.firebaseapp.com/guide/overview).
Here is the versions compatibility list:

| ng-rxjs-safe-subscribe | Angular | RxJs  |
| ---------------------- | ------- | ----- |
| 12.x.x                 | 12.x.x  | 6.x.x |
| 11.x.x                 | 11.x.x  | 6.x.x |
| 10.x.x                 | 10.x.x  | 6.x.x |
| 9.x.x                  | 9.x.x   | 6.x.x |

# License

[ISC](https://opensource.org/licenses/ISC)
