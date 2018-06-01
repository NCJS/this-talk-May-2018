const a = "global context";

function showThis() {
  console.log("This is ", this);
}

function foo(msg = "a is : ") {
  console.log(msg, this.a);
}

function callBack(cb) {
  // console.log("inside a callBack function");
  cb();
}

showThis(); // NOTE: in the browser it's Window object, in Babel it's undefined because of 'use strict'

let obj1 = {
  a: "obj1",
  foo: foo
};

obj1.foo();

let obj2 = {
  a: "obj2",
  foo: foo
};

obj2.foo();
obj1.foo.call(obj2);

foo.apply(obj2, ["xxxxx"]);

foo.call(obj2, "Using call to set this :");

setTimeout(obj1.foo, 100);

setTimeout(foo.bind(obj1), 100);

console.log("----- Using bind -----------");

// bind returns a function
let bound = {
  foo: foo.bind({ a: "forever bound" })
};

bound.foo();

bound.foo.call(obj2, "cant change because its bound by bind():");

console.log("----- Inside a callback -----------");

// callBack(obj1.foo);
callBack(obj1.foo.bind(obj1));
callBack(obj1.foo.bind(obj2));
callBack(function() {
  obj1.foo.call(obj1);
});
