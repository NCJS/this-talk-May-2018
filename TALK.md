# ` THIS`

#### NCJS Talk May 31st 2018

**Credit to `You don't know JS`**

> This` is a special identifier keyword that's automatically defined in the scope of **every** function.

```javascript
function showThis() {
  console.log(this);
}
// returns the Window {} in the browser, unless you're in 'use strict' mode, then it returns undefined
```

It is often somewhat confusing until you learn the rules governing the use of it.
The first common misconception is to assume that `this` refers to the function itself. Instead it refers to the context that the function was invoked.

### Trying to use `this` to refer to the function:

```javascript
function foo(num) {
  console.log("foo: " + num);
  // keep track of how many times `foo` is called
  this.count++;
}
foo.count = 0;
var i;
for (i = 0; i < 10; i++) {
  if (i > 5) {
    foo(i);
  }
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9
// how many times was `foo` called?
console.log(foo.count); // 0 -- WTF?
```

This doesn't work!

To solve this problem without having a global 'count' variable we can do this:

```javascript
function foo(num) {
  console.log("foo: " + num);
  // keep track of how many times `foo` is called
  foo.count++;
}
foo.count = 0;
var i;
for (i = 0; i < 10; i++) {
  if (i > 5) {
    foo(i);
  }
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9
// how many times was `foo` called?
console.log(foo.count); // 4
```

This works because in JS functions are first-class objects with methods and properties, so we just used an (undeclared) count variable in the lexical scope of `foo()`

In order to actually use `this` in this example we can set `this` explicitly by using `call()`.

```javascript
function foo(num) {
  console.log("foo: " + num);
  // keep track of how many times `foo` is called
  // Note: `this` IS actually `foo` now, based on
  // how `foo` is called (see below)
  this.count++;
}
foo.count = 0;
var i;
for (i = 0; i < 10; i++) {
  if (i > 5) {
    // using `call(..)`, we ensure the `this`
    // points at the function object (`foo`) itself
    foo.call(foo, i);
  }
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9
// how many times was `foo` called?
console.log(foo.count); // 4
```

> `This` is not an author-time binding but a runtime binding. It is contextual based on the conditions of the function's invocation. this binding has nothing to do with where a function is declared, but has instead everything to do with the manner in which the function is called. When a function is invoked, an activation record, otherwise known as an execution context, is created. This record contains information about where the function was called from (the call-stack), how the function was invoked, what parameters were passed, etc. One of the properties of this record is the this reference which will be used for the duration of that function's execution.

### Call Site:

`This` is going to be determined each time the function is called by the call-site and the manner in which the function is invoked.

Finding the call-site is generally: "go locate where a function is called from", but it's not
always that easy, as certain coding patterns can obscure the true call-site.
What's important is to think about the call-stack (the stack of functions that have been
called to get us to the current moment in execution). The call-site we care about is in the
invocation before the currently executing function.

```javascript
function baz() {
  // call-stack is: `baz`
  // so, our call-site is in the global scope
  console.log("baz");
  bar(); // <-- call-site for `bar`
}
function bar() {
  // call-stack is: `baz` -> `bar`
  // so, our call-site is in `baz`
  console.log("bar");
  foo(); // <-- call-site for `foo`
}
function foo() {
  // call-stack is: `baz` -> `bar` -> `foo`
  // so, our call-site is in `bar`
  console.log("foo");
}
baz(); // <-- call-site for `baz`
```

If in doubt about the call-stack use your debugger to find it out, either by setting breakpoints or by using a `debugger;` statement.

### The 4 Rules that determine `this`

#### Default:

This is when the function is simply called. **This is the catchall rule when no other rule applies**.

```javascript
function foo() {
  console.log(this.a);
}
var a = 2;
foo(); // 2
```

In this case `this` falls back to the `global` object. `foo()` is called with a plain, un-decorated function
reference. None of the other rules will apply here, so the default binding
applies instead.

If strict mode is in effect, the global object is not eligible for the default binding, so the
`this` is instead set to `undefined`.

NOTE: Babel enforces `'use strict'` out of the box unless otherwise instructed so don't count on this to work in modern environments.

### Implicit binding:

The next rule looks if the call-site has a `context object`.

```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 2,
  foo: foo
};
obj.foo(); // 2
```

> Firstly, notice the manner in which foo() is declared and then later added as a reference
> property onto obj . Regardless of whether foo() is initially declared on obj , or is added
> as a reference later (as this snippet shows), in neither case is the function really "owned" or
> "contained" by the obj object.
> However, the call-site uses the obj context to reference the function, so you could say that
> the obj object "owns" or "contains" the function reference at the time the function is
> called.

> Whatever you choose to call this pattern, at the point that foo() is called, it's preceded by
> an object reference to obj . When there is a context object for a function reference, the
> implicit binding rule says that it's that object which should be used for the function call's
> this binding.
> Because obj is the this for the foo() call, this.a is synonymous with obj.a .

**Only the last level of an object reference matters**

```javascript
function foo() {
  console.log(this.a);
}
var obj2 = {
  a: 42,
  foo: foo
};
var obj1 = {
  a: 2,
  obj2: obj2
};
obj1.obj2.foo(); // 42
```

#### Implicitly lost:

```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 2,
  foo: foo
};
var bar = obj.foo; // function reference/alias!
var a = "oops, global"; // `a` also property on global object
bar(); // "oops, global"
```

`bar` just points to `foo` and it's called directly (without object reference), so the default rule applies.

#### Function being invoked as a callback:

`This` get's 'lost', same thing can happen when using `jQuery` etc as they are setting `this` explicitly.

```javascript
function foo() {
  console.log(this.a);
}
function doFoo(fn) {
  // `fn` is just another reference to `foo`
  fn(); // <-- call-site!
}
var obj = {
  a: 2,
  foo: foo
};
var a = "oops, global"; // `a` also property on global object
doFoo(obj.foo); // "oops, global"
```

Same behavior:

```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 2,
  foo: foo
};
var a = "oops, global"; // `a` also property on global object
setTimeout(obj.foo, 100); // "oops, global"
```

### Explicit binding:

You can force a `this` on a function call without putting a property function reference on the object by using `call()` and `apply()`.

The first argument in `call()` and `apply()` will be your `this` for this invocation, you are setting it **explicitly**.

`Function.prototype.call(thisArg, arg1, arg2, ...)`, `thisArg` sets `this`, `arg1` etc are then additional arguments passed to the function.

`Function.prototype.apply(thisArg, [argsArray])`, same as `call()` but with the second parameter as an `Array`.

HINT: call() stands for 'comma' seperated, apply() stands for array

So:

```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 2,
  foo: foo
};
var a = "oops, global"; // `a` also property on global object
setTimeout(obj.foo.call(obj), 100); // 2
```

Another variation of this pattern is hard binding within an object:

```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 2
};
var bar = function() {
  foo.call(obj);
};
bar(); // 2
setTimeout(bar, 100); // 2
// `bar` hard binds `foo`'s `this` to `obj`
// so that it cannot be overriden
bar.call(window); // 2
```

Since hard binding is such a common pattern, it's provided with a built-in utility as of ES5:
Function.prototype.bind , and it's used like this:

```javascript
function foo(something) {
  console.log(this.a, something);
  return this.a + something;
}
var obj = {
  a: 2
};

var bar = foo.bind(obj);
var b = bar(3); // 2 3
console.log(b); // 5
```

> Note: As of ES6, the hard-bound function produced by bind(..) has a .name property
> that derives from the original target function. For example: bar = foo.bind(..) should have
> a bar.name value of "bound foo" , which is the function call name that should show up in a
> stack trac

NOTE: `bind` creates a new function, it is not linked anymore to the old one. You should never use bind within a `render` function in `React` (i.e. on eventHandlers) as it'll create a new function every time `render` get called (possibly hundreds of time), end up with performance loss.

### `new` Binding:

> When a function is invoked with new in front of it, otherwise known as a constructor call, the
> following things are done automatically:

1.  a brand new object is created (aka, constructed) out of thin air
2.  the newly constructed object is [[Prototype]] -linked
3.  the newly constructed object is set as the this binding for that function call
4.  unless the function returns its own alternate object, the new -invoked function call will
    automatically return the newly constructed object.

```javascript
function foo(a) {
  this.a = a;
}
var bar = new foo(2);
console.log(bar.a); // 2
```

By calling `foo(..)` with `new` in front of it, we've constructed a new object and set that new
object as the this for the call of `foo(..)` . So new is the final way that a function call's
this can be bound. We'll call this **new binding**.

### Order of the 4 Rules:

1.  `new`
2.  explicit
3.  implicit
4.  default
