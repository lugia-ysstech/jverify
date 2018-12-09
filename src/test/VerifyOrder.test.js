/**
 * Created by liguoxin on 2017/3/1.
 * @flow
 */
const chai = require('chai');
const VerifyOrder = require('../lib/VerifyOrder');
const MockModule = require('../lib/MockModule');

const {
  create,
  createOrgial,
} = VerifyOrder;

const { assert } = chai;
const { expect } = chai;

describe('VerifyOrder', function () {


  /*
   a.af1(1);
   a.af1(1, 4);
   b.bf1(1, 2);
   c 1.cf1(1, 2, 3);

   */
  function mockModuleFunc (): any {
    const order = create();
    const A = {},
      B = {},
      C = {};

    order.addModuleCallFunction('a', 'af1', {
      context: A,
      args: [ 1 ],
    });
    order.addModuleCallFunction('a', 'af1', {
      context: A,
      args: [ 1, 4 ],
    });

    order.addModuleCallFunction('b', 'bf1', {
      context: B,
      args: [ 1, 2 ],
    });

    order.addModuleCallFunction('c 1', 'cf1', {
      context: C,
      args: [ 1, 2, 3 ],
    });

    return { order, A, B, C };
  }

  /*
   a.a1;
   a.a2;
   b.b1;
   b.b2;
   c.c1;
   b.b3;

   */
  function mockModuleVar (): any {
    const order = create();


    order.addModuleVar('a', 'a1');
    order.addModuleVar('a', 'a2');
    order.addModuleVar('b', 'a1');
    order.addModuleVar('b', 'b2');
    order.addModuleVar('c', 'c1');
    order.addModuleVar('b', 'b31');

    return { order };
  }

  it('test addModuleCallFunction error  step is same', () => {
    const { A, B, order } = mockModuleFunc();
    try {
      order.verify((obj: Object): any => {
        const { a, b } = obj;
        a.af1(1).withContext(A);
        a.af1(1).withContext(A);
        b.bf1(1, 2).withContext(B);
        obj[ 'c 1' ].cf1(1, 2, 3).withContext(A);
      });

    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.af1(1);           a.af1(1);
2.  a.af1(1, 4);        a.af1(1);  <-- args is error
3.  b.bf1(1, 2);        b.bf1(1, 2);
4.  c 1.cf1(1, 2, 3);   c 1.cf1(1, 2, 3);  <-- context is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });
  it('test addModuleCallFunction for param type', () => {
    const order = create(),
      A = { a: '1' };
    order.addModuleCallFunction('a', 'f1', {
      context: A,
      args: [ 1, false, 'hello', [ 1, 2, 3 ], { a: 'a', b: [ 1, 2, 3 ] } ],
    });
    try {
      order.verify((obj: Object): any => {
        const { a } = obj;
        a.af1(1).withContext(A);
      });

    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.f1(1, false, "hello", [1,2,3], {"a":"a","b":[1,2,3]});  <-- a.af1 is undefined & step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('test addModuleCallFunction error  expected is more then actuly', () => {
    const { A, B, order } = mockModuleFunc();
    try {
      order.verify((obj: Object): any => {
        const { a, b } = obj;
        a.af1(1).withContext(A);
        a.af1(1).withContext(A);
        b.bf1(1, 2).withContext(B);
        b.bf1(1, 3).withContext(B);
        b.bf1(1, 4).withContext(B);
        obj[ 'c 1' ].cf1(1, 2, 3).withContext(A);
      });

    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.af1(1);           a.af1(1);
2.  a.af1(1, 4);        a.af1(1);  <-- args is error
3.  b.bf1(1, 2);        b.bf1(1, 2);
4.  c 1.cf1(1, 2, 3);   b.bf1(1, 3);  <-- module & name & args & context is error
5.                      b.bf1(1, 4);  <-- step is error
6.                      c 1.cf1(1, 2, 3);  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('test addModuleCallFunction error  func is undefined on 1 number line', () => {
    const { order } = mockModuleFunc();
    try {
      order.verify((obj: Object): any => {
        const { a } = obj;
        a.dd();
      });

    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.af1(1);          <-- a.dd is undefined & step is error
2.  a.af1(1, 4);       <-- step is error
3.  b.bf1(1, 2);       <-- step is error
4.  c 1.cf1(1, 2, 3);  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('test addModuleCallFunction error  func is undefined before  error', () => {
    const { order } = mockModuleFunc();
    try {
      order.verify((obj: Object): any => {
        const { a, b } = obj;
        a.af1(1);
        a.af1(1, 4);
        b.bf1(2, 3);
        obj[ 'c 1' ].a(1, 2, 3);
        b.bf1(1, 2);
      });

    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.af1(1);           a.af1(1);
2.  a.af1(1, 4);        a.af1(1, 4);
3.  b.bf1(1, 2);        b.bf1(2, 3);  <-- args is error
4.  c 1.cf1(1, 2, 3);  <-- c 1.a is undefined & step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('test addModuleCallFunction error  has undefined error before right mock visitr', () => {
    const { order } = mockModuleFunc();
    try {
      order.verify((obj: Object): any => {
        const { a, b } = obj;
        a.af1(1);
        a.af1(1, 4);
        b.bf21(2, 3);
        obj[ 'c 1' ].c1(1, 2, 3);
      });

    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.af1(1);           a.af1(1);
2.  a.af1(1, 4);        a.af1(1, 4);
3.  b.bf1(1, 2);       <-- b.bf21 is undefined & step is error
4.  c 1.cf1(1, 2, 3);  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('test addModuleCallFunction error  func is undefined on last line', () => {
    const { order } = mockModuleFunc();
    try {
      order.verify((obj: Object): any => {
        const { a, b } = obj;
        a.af1(1);
        a.af1(1, 4);
        b.bf1(1, 2);
        obj[ 'c 1' ].a(1, 2, 3);
      });

    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.af1(1);           a.af1(1);
2.  a.af1(1, 4);        a.af1(1, 4);
3.  b.bf1(1, 2);        b.bf1(1, 2);
4.  c 1.cf1(1, 2, 3);  <-- c 1.a is undefined & step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });
  it('test addModuleCallFunction error  func is undefined on 3 number line', () => {
    const { order } = mockModuleFunc();
    try {
      order.verify((obj: Object): any => {
        const { a, ddd } = obj;
        a.af1(1);
        a.af1(1, 4);
        ddd.aaa();
        obj[ 'c 1' ].cf1(1, 2, 3);
      });

    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.af1(1);           a.af1(1);
2.  a.af1(1, 4);        a.af1(1, 4);
3.  b.bf1(1, 2);       <-- Cannot read property 'aaa' of undefined & step is error
4.  c 1.cf1(1, 2, 3);  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });
  it('test addModuleCallFunction no any func called', () => {
    const { order } = mockModuleFunc();
    try {
      order.verify(() => {
      });

    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.af1(1);          <-- step is error
2.  a.af1(1, 4);       <-- step is error
3.  b.bf1(1, 2);       <-- step is error
4.  c 1.cf1(1, 2, 3);  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });


  it('test addModuleVar error  no any visited', () => {
    const { order } = mockModuleVar();
    try {
      order.verify(() => {
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.a1;   <-- step is error
2.  a.a2;   <-- step is error
3.  b.a1;   <-- step is error
4.  b.b2;   <-- step is error
5.  c.c1;   <-- step is error
6.  b.b31;  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });
  it('test addModuleVar error has undefined error before right mock visit', () => {
    const { order } = mockModuleVar();
    try {
      order.verify((obj: Object): any => {
        const { a, b } = obj;
        a.a1;
        a.a2;
        b.b33;
        b.a2;
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.a1;    a.a1;
2.  a.a2;    a.a2;
3.  b.a1;   <-- b.b33 is undefined & step is error
4.  b.b2;   <-- step is error
5.  c.c1;   <-- step is error
6.  b.b31;  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('test addModuleVar error  expected is less then actuly line 1 is error', () => {
    const { order } = mockModuleVar();
    try {
      order.verify((obj: Object): any => {
        const { a } = obj;
        a.a2;
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.a1;    a.a2;  <-- name is error
2.  a.a2;   <-- step is error
3.  b.a1;   <-- step is error
4.  b.b2;   <-- step is error
5.  c.c1;   <-- step is error
6.  b.b31;  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });
  it('test addModuleVar error  modulename error', () => {
    const { order } = mockModuleVar();
    try {
      order.verify((obj: Object): any => {
        const { b } = obj;
        b.a1;
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.a1;    b.a1;  <-- module is error
2.  a.a2;   <-- step is error
3.  b.a1;   <-- step is error
4.  b.b2;   <-- step is error
5.  c.c1;   <-- step is error
6.  b.b31;  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });
  it('test addModuleVar b is undefined', () => {
    const { order } = mockModuleVar();
    try {
      order.verify((obj: Object): any => {
        const { b } = obj;
        b.a21;
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.a1;   <-- b.a21 is undefined & step is error
2.  a.a2;   <-- step is error
3.  b.a1;   <-- step is error
4.  b.b2;   <-- step is error
5.  c.c1;   <-- step is error
6.  b.b31;  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('test addModuleVar a.f3 is undefined', () => {
    const { order } = mockModuleVar();
    try {
      order.verify((obj: Object): any => {
        const { a } = obj;
        a.a1;
        a.a2;
        a.a3;
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.a1;    a.a1;
2.  a.a2;    a.a2;
3.  b.a1;   <-- a.a3 is undefined & step is error
4.  b.b2;   <-- step is error
5.  c.c1;   <-- step is error
6.  b.b31;  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('test addModuleVar error  expected is less then actuly line 1  is right', () => {
    const { order } = mockModuleVar();
    try {
      order.verify((obj: Object): any => {
        const { a } = obj;
        a.a1;
        a.a1;
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.a1;    a.a1;
2.  a.a2;    a.a1;  <-- name is error
3.  b.a1;   <-- step is error
4.  b.b2;   <-- step is error
5.  c.c1;   <-- step is error
6.  b.b31;  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  function mockFunction (): Object {
    const order = create(),
      A = {},
      B = {},
      C = {};

    order.addCallFunction('a', { context: A, args: [ 1, 2 ] });
    order.addCallFunction('a', { context: A, args: [ 'hello', false ] });
    order.addCallFunction('b', { context: B, args: [ [ 1, 2, 3 ], { a: '1', b: [ 4, 5, 6 ] } ] });
    order.addCallFunction('c', { context: C, args: [ 6, 7 ] });
    order.addCallFunction('b', { context: B, args: [ 'hello' ] });
    return { order, A, B, C };
  }


  it('test addCallFunction call sucess', () => {
    const { order } = mockFunction();
    order.verify((obj: Object): any => {
      const { a, b, c } = obj;
      a(1, 2);
      a('hello', false);
      b([ 1, 2, 3 ], { a: '1', b: [ 4, 5, 6 ] });
      c(6, 7);
      b('hello');
    });
  });

  it('test addCallFunction call sucess with Context', () => {
    const { order, A, B, C } = mockFunction();
    order.verify((obj: Object): any => {
      const { a, b, c } = obj;
      a(1, 2).withContext(A);
      a('hello', false).withContext(A);
      b([ 1, 2, 3 ], { a: '1', b: [ 4, 5, 6 ] }).withContext(B);
      c(6, 7).withContext(C);
      b('hello').withContext(B);
    });
  });

  it('test addCallFunction call error expect more than actual', () => {
    const { order } = mockFunction();
    try {

      order.verify((obj: Object): any => {
        const { a } = obj;
        a(1, 2, 3);
        a(1, 2, 3);
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a(1, 2);                             a(1, 2, 3);  <-- args is error
2.  a("hello", false);                   a(1, 2, 3);  <-- args is error
3.  b([1,2,3], {"a":"1","b":[4,5,6]});  <-- step is error
4.  c(6, 7);                            <-- step is error
5.  b("hello");                         <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('test addCallFunction call error actual more than expect', () => {
    const { order } = mockFunction();
    try {

      order.verify((obj: Object): any => {
        const { a } = obj;
        a(1, 2, 3);
        a(1, 2, 3);
        a(1, 2, 3);
        a(1, 2, 3);
        a(1, 2, 3);
        a(1, 2, 3);
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a(1, 2);                             a(1, 2, 3);  <-- args is error
2.  a("hello", false);                   a(1, 2, 3);  <-- args is error
3.  b([1,2,3], {"a":"1","b":[4,5,6]});   a(1, 2, 3);  <-- module & args is error
4.  c(6, 7);                             a(1, 2, 3);  <-- module & args is error
5.  b("hello");                          a(1, 2, 3);  <-- module & args is error
6.                                       a(1, 2, 3);  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });
  it('test addCallFunction call error arg error 1', () => {
    const { order } = mockFunction();
    try {

      order.verify((obj: Object): any => {
        const { a, b, c } = obj;
        a(1, 3);
        a('hello', false);
        b([ 1, 2, 3 ], { a: '1', b: [ 4, 5, 6 ] });
        c(6, 7);
        b('hello');
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a(1, 2);                             a(1, 3);  <-- args is error
2.  a("hello", false);                   a("hello", false);
3.  b([1,2,3], {"a":"1","b":[4,5,6]});   b([1,2,3], {"a":"1","b":[4,5,6]});
4.  c(6, 7);                             c(6, 7);
5.  b("hello");                          b("hello");`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });
  it('test addCallFunction call error arg error 2 ', () => {
    const { order } = mockFunction();
    try {

      order.verify((obj: Object): any => {
        const { a, b, c } = obj;
        a(1, 2);
        a('a', false);
        b([ 1, 2, 3 ], { a: '1', b: [ 4, 5, 6 ] });
        c(6, 7);
        b('hello');
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a(1, 2);                             a(1, 2);
2.  a("hello", false);                   a("a", false);  <-- args is error
3.  b([1,2,3], {"a":"1","b":[4,5,6]});   b([1,2,3], {"a":"1","b":[4,5,6]});
4.  c(6, 7);                             c(6, 7);
5.  b("hello");                          b("hello");`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });
  it('test addCallFunction call error arg error 3 ', () => {
    const { order } = mockFunction();
    try {

      order.verify((obj: Object): any => {
        const { a, b, c } = obj;
        a('a');
        a('a', false);
        b([ 1, 2, 3 ], { a: '1', b: [ 4, 5, 6 ] });
        c(6, 7);
        b('hello');
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a(1, 2);                             a("a");  <-- args is error
2.  a("hello", false);                   a("a", false);  <-- args is error
3.  b([1,2,3], {"a":"1","b":[4,5,6]});   b([1,2,3], {"a":"1","b":[4,5,6]});
4.  c(6, 7);                             c(6, 7);
5.  b("hello");                          b("hello");`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });


  it('test addCallFunction & addModuleVar & addModuleCallFunction for two sucess & error', () => {
    const order = create(),
      ctxA = { id: 1 },
      ctxB = { id: 2 },
      ctxC = { id: 3 };

    order.addCallFunction('f1', { args: [ 1 ], context: ctxA });
    order.addCallFunction('f2', { args: [ 'hello' ], context: ctxB });
    order.addModuleVar('obj1', 'v1');
    order.addModuleCallFunction('obj1', 'f1', { args: [ 'hello', 'world' ], context: ctxC });
    order.addModuleVar('obj2', 'v2');
    order.addModuleCallFunction('obj2', 'f2', { args: [ 1, true, 'king' ], context: ctxC });


    order.verify((obj: Object): any => {
      const { f1, f2, obj1, obj2 } = obj;
      f1(1);
      f2('hello');
      obj1.v1;
      obj1.f1('hello', 'world');
      obj2.v2;
      obj2.f2(1, true, 'king');
    });

    order.verify((obj: Object): any => {
      const { f1, f2, obj1, obj2 } = obj;
      f1(1);
      f2('hello');
      obj1.v1;
      obj1.f1('hello', 'world');
      obj2.v2;
      obj2.f2(1, true, 'king');
    });

    try {

      order.verify((obj: Object): any => {
        const { f1, f2, obj1, obj2 } = obj;
        f1(2);
        f2('hello');
        obj1.v1;
        obj1.f1('hello', 'world');
        obj2.v2;
        obj2.f2(1, true, 'king');
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  f1(1);                       f1(2);  <-- args is error
2.  f2("hello");                 f2("hello");
3.  obj1.v1;                     obj1.v1;
4.  obj1.f1("hello", "world");   obj1.f1("hello", "world");
5.  obj2.v2;                     obj2.v2;
6.  obj2.f2(1, true, "king");    obj2.f2(1, true, "king");`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');

  });

  it('test last step is error', () => {
    const order = create();
    order.addModuleCallFunction('a', 'f1');
    try {
      order.verify((obj: Object): any => {
        const { a } = obj;
        a.f1();
        a.f2();
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.f1();   a.f1();
2.  <-- a.f2 is undefined & step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');

  });
  it('test mid step is error', () => {
    const order = create();
    order.addModuleCallFunction('a', 'f1');
    order.addModuleCallFunction('a', 'f1');
    try {
      order.verify((obj: Object): any => {
        const { a } = obj;
        a.f1();
        a.f2();
        a.f1();
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.f1();   a.f1();
2.  a.f1();  <-- a.f2 is undefined & step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');

  });
  it('test callInfo  args has undefined', () => {
    const order = create();
    order.addModuleCallFunction('a', 'f1', {
      context: {},
      args: [ { a: undefined } ],
    });
    try {
      order.verify((obj: Object): any => {
        const { a } = obj;
        a.f1();
      });
    } catch (err) {

      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.f1({"a":"value is undefined"});   a.f1();  <-- args is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');

  });
  it('test callInfo  args is as function', () => {
    const order = create();
    const f1 = () => { };
    order.addModuleCallFunction('a', 'f1', {
      context: {},
      args: [ f1 ],
    });
    try {
      order.verify((obj: Object): any => {
        const { a } = obj;
        a.f1();
      });
    } catch (err) {
      const f1Str = f1.toString();
      expect(err.message.replace(/\\n/g, '\n')).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.f1(${f1Str});   a.f1();  <-- args is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('test callInfo  args is Object it is normal Object', () => {
    const order = create();
    const obj = {
      name: 'ligx',
      desc: '诸法无我',
    };
    order.addModuleCallFunction('a', 'f1', {
      context: {},
      args: [ obj ],
    });
    try {
      order.verify((obj: Object): any => {
        const { a } = obj;
        a.f1();
      });
    } catch (err) {
      const objStr = JSON.stringify(obj);
      expect(err.message.replace(/\\n/g, '\n')).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.f1(${objStr});   a.f1();  <-- args is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('test callInfo  args is Object it is normal Object the function props Writable is false', () => {
    const order = create();
    const obj: {
      desc: Function
    } = {
      desc: () => {},
    };
    Object.defineProperty(obj, 'desc', {
      value: () => {},
      writable: false,
    });

    order.addModuleCallFunction('a', 'f1', {
      context: {},
      args: [ obj ],
    });
    try {
      order.verify((obj: Object): any => {
        const { a } = obj;
        a.f1();
      });
    } catch (err) {
      const objStr = '{"desc":"() => {}"}';
      expect(err.message.replace(/\\n/g, '\n')).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.f1(${objStr});   a.f1();  <-- args is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });


  it('test callInfo  args is object  it has function', () => {
    const order = create();
    const f1 = () => { };
    const f2 = () => {

    };
    order.addModuleCallFunction('a', 'f1', {
      context: {},
      args: [ {
        f1,
        f2,
      } ],
    });
    try {
      order.verify((obj: Object): any => {
        const { a } = obj;
        a.f1();
      });
    } catch (err) {
      const f1Str = f1.toString();
      const f2Str = f2.toString();
      expect(err.message.replace(/\\n/g, '\n')).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.f1({"f1":"` + f1Str + `","f2":"${f2Str}"});   a.f1();  <-- args is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('callinfo args is Error Object', () => {

    const order = create();
    const error = new Error('hello');
    order.addModuleCallFunction('a', 'f1', {
      context: {},
      args: [ error ],
    });
    try {
      order.verify((obj: Object): any => {
        const { a } = obj;
        a.f1();
      });
    } catch (err) {
      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.f1({"message":"${error.message}");   a.f1();  <-- args is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('callinfo args is object has Error attribute', () => {

    const order = create();
    const error = new Error('hello');
    order.addModuleCallFunction('a', 'f1', {
      context: {},
      args: [ { err: error } ],
    });
    try {
      order.verify((obj: Object): any => {
        const { a } = obj;
        a.f1();
      });
    } catch (err) {
      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.f1({"err":{"message":"${error.message}"}});   a.f1();  <-- args is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('args is undefined', () => {
    const order = create();
    const hello = { world: 'hello' };
    order.addModuleCallFunction('a', 'f1', {
      context: hello,
    });
    order.verify((mock: Object) => {
      const { a } = mock;
      a.f1();
    });
  });
  it('verify is empty', () => {
    const order = create();
    order.verify(() => {
    });
  });
  it('verify is empty and verify method has error', () => {
    const order = create();
    const msg = 'hello';
    try {
      order.verify(() => {
        throw new Error(msg);
      });
    } catch (err) {
      expect(() => { throw err; }).throw(Error, msg);
      return;
    }
    expect(true).to.be.false;
  });


  it('verify for arg is any', () => {
    const { Any } = VerifyOrder;
    const order = create();
    order.addModuleCallFunction('a', 'f1', {
      args: [ 1, 2 ],
    });
    order.verify(({ a }: any) => {
      a.f1(Any, Any);
    });
  });

  it('verify for single arg  Any Any', () => {
    const { Any } = VerifyOrder;

    const order = create();
    order.addModuleCallFunction('a', 'f1', {
      args: [ 'any' ],
    });
    expect(() => {
      order.verify(({ a }: any) => {
        a.f1(Any, Any);

      });
    }).to.be.throw();
  });

  it('verify for arg-object  Any Any', () => {
    const { Any } = VerifyOrder;

    const order = create();
    const param = { name: 'hello', hello: 'name' };
    order.addModuleCallFunction('a', 'f1', {
      args: [ param ],
    });
    order.verify(({ a }: any) => {
      a.f1({ name: Any, hello: Any });
    });
  });

  it('verify for arg-two-level-object  Any', () => {
    const { Any } = VerifyOrder;

    const order = create();
    const param = { one: { two: '' } };
    order.addModuleCallFunction('a', 'f1', {
      args: [ param ],
    });
    order.verify(({ a }: any) => {
      a.f1({ one: Any });
    });
  });

  it('verify for arg-two-level-object  two-level', () => {
    const { Any } = VerifyOrder;

    const order = create();
    const param = { one: { two: '' } };
    order.addModuleCallFunction('a', 'f1', {
      args: [ param ],
    });
    order.verify(({ a }: any) => {
      a.f1({ one: { two: Any } });
    });
  });

  it('verify for arg-object  Any ', () => {
    const { Any } = VerifyOrder;

    const order = create();
    const param = { name: 'hello' };
    order.addModuleCallFunction('a', 'f1', {
      args: [ param ],
    });
    order.verify(({ a }: any) => {
      a.f1({ name: Any });
    });
  });
  it('verify for arg-object-array any ', () => {
    const { Any } = VerifyOrder;

    const order = create();
    const param = { name: [ 'a', 'b', 'c' ] };
    order.addModuleCallFunction('a', 'f1', {
      args: [ param ],
    });
    order.verify(({ a }: any) => {
      a.f1({ name: [ Any, VerifyOrder.String, VerifyOrder.String ] });
    });
  });

  it('verify for arg-array any ', () => {

    const order = create();
    order.addModuleCallFunction('a', 'f1', {
      args: [ [ 'a', '1', 1 ] ],
    });
    order.verify(({ a }: any) => {
      a.f1([ VerifyOrder.String, VerifyOrder.Any, VerifyOrder.Number ]);
    });
  });

  it('verify for circle struct for sucess', () => {
    const { Any } = VerifyOrder;

    const order = create();
    const param = { id: 'main' };
    const paramB = { id: 'b' };
    paramB.a = param;
    param.b = paramB;
    order.addModuleCallFunction('a', 'f1', {
      args: [ param ],
    });
    order.verify(({ a }: any) => {
      a.f1(Any);
    });
  });
  it('verify for [[[[1]]]] Any', () => {
    const { Any } = VerifyOrder;

    const order = create();
    const param = [ [ [ [ 1 ] ] ] ];
    order.addModuleCallFunction('a', 'f1', {
      args: [ param ],
    });
    order.verify(({ a }: any) => {
      a.f1(Any);
    });
  });
  it('verify for [[[[1]]]] [Any]', () => {
    const { Any } = VerifyOrder;

    const order = create();
    const param = [ [ [ [ 1 ] ] ] ];
    order.addModuleCallFunction('a', 'f1', {
      args: [ param ],
    });
    order.verify(({ a }: any) => {
      a.f1([ Any ]);
    });
  });

  it('verify for [[[[1]]]] [[Any]]', () => {
    const { Any } = VerifyOrder;

    const order = create();
    const param = [ [ [ [ 1 ] ] ] ];
    order.addModuleCallFunction('a', 'f1', {
      args: [ param ],
    });
    order.verify(({ a }: any) => {
      a.f1([ [ Any ] ]);
    });
  });
  it('verify for [[[[1]]]] [[[Any]]]', () => {
    const { Any } = VerifyOrder;

    const order = create();
    const param = [ [ [ [ 1 ] ] ] ];
    order.addModuleCallFunction('a', 'f1', {
      args: [ param ],
    });
    order.verify(({ a }: any) => {
      a.f1([ [ [ Any ] ] ]);
    });
  });

  it('verify for [[[[1]]]] [[[[Number]]]]', () => {

    const order = create();
    const param = [ [ [ [ 1 ] ] ] ];
    order.addModuleCallFunction('a', 'f1', {
      args: [ param ],
    });
    order.verify(({ a }: any) => {
      a.f1([ [ [ [ VerifyOrder.Number ] ] ] ]);
    });
  });

  it('verify for circle struct for error', () => {
    try {
      const order = create();
      const param = { id: 'main' };
      const paramB = { id: 'b' };
      paramB.a = param;
      param.b = paramB;
      order.addModuleCallFunction('a', 'f1', {
        args: [ param ],
      });
      order.verify(({ a }: any) => {
        a.f1(1);
      });
    } catch (err) {
      expect(err.message.startsWith('验证失败，左边为实际调用顺序，右边为期望调用顺序')).to.be.true;
    }

  });

  it('verify for repeat ref', () => {
    const order = create();
    const data = { hello: 'world' };
    const param = { a: data, b: data, name: 1 };
    order.addModuleCallFunction('a', 'f1', {
      args: [ param ],
    });
    order.verify(({ a }: any) => {
      a.f1({ a: { hello: 'world' }, b: { hello: 'world' }, name: VerifyOrder.Number });
    });
  });

  it('verify for repeat ref error', () => {
    const order = create();
    const data = { hello: 'world' };
    const param = { a: data, b: data, name: 1 };
    order.addModuleCallFunction('a', 'f1', {
      args: [ param ]
    });
    try {
      order.verify(({ a }) => {
        a.f1(data);
      });
    } catch (err) {
      console.info(err.message);
      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.f1({"a":{"hello":"world"},"b":{"hello":"world"},"name":1});   a.f1({"hello":"world"});  <-- args is error`);
      return;
    }
  });
  class Ligx{
    constructor (name){
      this.name = name;
    }
    hello(){
      console.info('world');
    }
  }
  it('verify for mockObject', () => {
    const order = create();
    const data =  new Ligx('xiaoming');

    const mockData = MockModule.create(data);
    mockData.mockFunction('hello');

    order.addModuleCallFunction('a', 'f1', {
      args: [ data ],
    });
    order.verify(({ a }: any) => {
      a.f1(data);
    });
  });

});
