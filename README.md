<h1 align="center">ng-rxjs-safe-subscribe</h1>

<p align="center">
Implementation of <a href="https://angular.io/">Angular's</a> repeatable OnDestroy pattern with <a href="https://rxjs-dev.firebaseapp.com/guide/overview/">RxJs</a> observables.
</p>

<p align="center">
    <a href="https://badge.fury.io/js/ngx-bootstrap"><img src="https://badge.fury.io/js/ng-rxjs-safe-subscribe.svg" alt="npm version" ></a>
    <a href="https://npmjs.org/ngx-bootstrap"><img src="https://img.shields.io/npm/dm/ng-rxjs-safe-subscribe.svg" alt="npm downloads" ></a>
</p>

## Why do I need it?

Bacasue of DRY principle.

One of common mistakes a beginers make and others forget to avoid is to subscribe to an Observable in a fire-and-forget manner:
```
books$.subscribe(() => doSomething()));
```

Rule of thumb is that subscriber should unsubscibe when the values are no longer used. If there is no explicit unsubscribe, then books will be pushed to subscribe function indefinitely. While it may not be the case for some observable sources, it is almost always casues a <i>leaks</i> leading to issues.

There a few way to deal with it:
1. unsubscribe directly from subscribtion - it'll unsubscribe all subscribers
2. unsubscribe with an operator takeUntil, takeWhile - safer, it'll unsubscribe single subscribtion

Package `ng-rxjs-safe-subscribe` provides ready and easy to use solution for your every Angular project.


## Installation instructions

Install `ng-rxjs-safe-subscribe` from `npm`:

```bash
npm install ng-rxjs-safe-subscribe --save
```

Import an abstract class:
```
import { RxjsOnDestroy } from 'ng-rxjs-safe-subscribe';
```

Extend the class with `RxjsOnDestroy` that implements `OnDestroy` hook.
```
export class AppComponent extends RxjsOnDestroy
```

Subscibe safely like so:
```
this.users$.safeSubscribe(rxjsOnDestroyInstance, (x) => console.log(x));
```

Full example:
```
import { Component } from '@angular/core';
import { RxjsOnDestroy } from 'ng-rxjs-safe-subscribe';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends RxjsOnDestroy {
  users$: Observable<User[]>;

  constructor() {
    super();

    this.users$.safeSubscribe(this, (x) => console.log(x));
  }
}
```

## Compatibility

The only two dependencies are [Angular](https://angular.io) and [RxJs](https://rxjs-dev.firebaseapp.com/guide/overview).
Here is the versions compatibility list:

| ng-rxjs-safe-subscribe |   Angular   |  RxJs |
| ---------------------- | ----------- | ----- |
| 12.x.x-next            | 12.x.x-next | 6.x.x |
| 11.x.x                 | 11.x.x      | 6.x.x |
| 10.x.x                 | 10.x.x      | 6.x.x |
| 9.x.x                  | 9.x.x       | 6.x.x |

## License

[ISC](https://opensource.org/licenses/ISC)
