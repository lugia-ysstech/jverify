/**
 * Created by liguoxin on 2017/3/1.
 * @flow
 */
const chai = require('chai');
const { create } = require('../dist/VerifyOrder');

const { assert } = chai;
const { expect } = chai;

describe('VerifyOrder', function () {


  /*
   a.af1(1);
   a.af1(1, 4);
   b.bf1(1, 2);
   c 1.cf1(1, 2, 3);

   */
  function mockModuleFunc () {
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
  function mockModuleVar () {
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
      order.verify(obj => {
        const { a, b } = obj;
        a.af1(1).withContext(A);
        a.af1(1).withContext(A);
        b.bf1(1, 2).withContext(B);
        obj[ 'c 1' ].cf1(1, 2, 3).withContext(A);
      });

    } catch (err) {
      console.info(err);
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
      order.verify(obj => {
        const { a } = obj;
        a.af1(1).withContext(A);
      });

    } catch (err) {
      console.info(err);
      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.f1(1, false, "hello", [1,2,3], {"a":"a","b":[1,2,3]});  <-- a.af1 is undefined & step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('test addModuleCallFunction error  expected is more then actuly', () => {
    const { A, B, order } = mockModuleFunc();
    try {
      order.verify(obj => {
        const { a, b } = obj;
        a.af1(1).withContext(A);
        a.af1(1).withContext(A);
        b.bf1(1, 2).withContext(B);
        b.bf1(1, 3).withContext(B);
        b.bf1(1, 4).withContext(B);
        obj[ 'c 1' ].cf1(1, 2, 3).withContext(A);
      });

    } catch (err) {
      console.info(err);
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
      order.verify(obj => {
        const { a } = obj;
        a.dd();
      });

    } catch (err) {
      console.info(err);
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
      order.verify(obj => {
        const { a, b } = obj;
        a.af1(1);
        a.af1(1, 4);
        b.bf1(2, 3);
        obj[ 'c 1' ].a(1, 2, 3);
        b.bf1(1, 2);
      });

    } catch (err) {
      console.info(err);
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
      order.verify(obj => {
        const { a, b } = obj;
        a.af1(1);
        a.af1(1, 4);
        b.bf21(2, 3);
        obj[ 'c 1' ].c1(1, 2, 3);
      });

    } catch (err) {
      console.info(err);
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
      order.verify(obj => {
        const { a, b } = obj;
        a.af1(1);
        a.af1(1, 4);
        b.bf1(1, 2);
        obj[ 'c 1' ].a(1, 2, 3);
      });

    } catch (err) {
      console.info(err);
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
      order.verify(obj => {
        const { a, ddd } = obj;
        a.af1(1);
        a.af1(1, 4);
        ddd.aaa();
        obj[ 'c 1' ].cf1(1, 2, 3);
      });

    } catch (err) {
      console.info(err);
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
      console.info(err);
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
      console.info(err);
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
      order.verify(obj => {
        const { a, b } = obj;
        a.a1;
        a.a2;
        b.b33;
        b.a2;
      });
    } catch (err) {
      console.info(err);
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
      order.verify(obj => {
        const { a } = obj;
        a.a2;
      });
    } catch (err) {
      console.info(err);
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
      order.verify(obj => {
        const { b } = obj;
        b.a1;
      });
    } catch (err) {
      console.info(err);
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
      order.verify(obj => {
        const { b } = obj;
        b.a21;
      });
    } catch (err) {
      console.info(err);
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
      order.verify(obj => {
        const { a } = obj;
        a.a1;
        a.a2;
        a.a3;
      });
    } catch (err) {
      console.info(err);
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
      order.verify(obj => {
        const { a } = obj;
        a.a1;
        a.a1;
      });
    } catch (err) {
      console.info(err);
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

  function mockFunction () {
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
    order.verify(obj => {
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
    order.verify(obj => {
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

      order.verify(obj => {
        const { a } = obj;
        a(1, 2, 3);
        a(1, 2, 3);
      });
    } catch (err) {
      console.info(err);
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

      order.verify(obj => {
        const { a } = obj;
        a(1, 2, 3);
        a(1, 2, 3);
        a(1, 2, 3);
        a(1, 2, 3);
        a(1, 2, 3);
        a(1, 2, 3);
      });
    } catch (err) {
      console.info(err);
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

      order.verify(obj => {
        const { a, b, c } = obj;
        a(1, 3);
        a('hello', false);
        b([ 1, 2, 3 ], { a: '1', b: [ 4, 5, 6 ] });
        c(6, 7);
        b('hello');
      });
    } catch (err) {
      console.info(err);
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

      order.verify(obj => {
        const { a, b, c } = obj;
        a(1, 2);
        a('a', false);
        b([ 1, 2, 3 ], { a: '1', b: [ 4, 5, 6 ] });
        c(6, 7);
        b('hello');
      });
    } catch (err) {
      console.info(err);
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

      order.verify(obj => {
        const { a, b, c } = obj;
        a('a');
        a('a', false);
        b([ 1, 2, 3 ], { a: '1', b: [ 4, 5, 6 ] });
        c(6, 7);
        b('hello');
      });
    } catch (err) {
      console.info(err);
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


    order.verify(obj => {
      const { f1, f2, obj1, obj2 } = obj;
      f1(1);
      f2('hello');
      obj1.v1;
      obj1.f1('hello', 'world');
      obj2.v2;
      obj2.f2(1, true, 'king');
    });

    order.verify(obj => {
      const { f1, f2, obj1, obj2 } = obj;
      f1(1);
      f2('hello');
      obj1.v1;
      obj1.f1('hello', 'world');
      obj2.v2;
      obj2.f2(1, true, 'king');
    });

    try {

      order.verify(obj => {
        const { f1, f2, obj1, obj2 } = obj;
        f1(2);
        f2('hello');
        obj1.v1;
        obj1.f1('hello', 'world');
        obj2.v2;
        obj2.f2(1, true, 'king');
      });
    } catch (err) {
      console.info(err);
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
      order.verify(obj => {
        const { a } = obj;
        a.f1();
        a.f2();
      });
    } catch (err) {
      console.info(err);
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
      order.verify(obj => {
        const { a } = obj;
        a.f1();
        a.f2();
        a.f1();
      });
    } catch (err) {
      console.info(err);
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
      order.verify(obj => {
        const { a } = obj;
        a.f1();
      });
    } catch (err) {
      console.info(err);
      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.f1({"a":"value is undefined"});   a.f1();  <-- args is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');

  });
  it('test callInfo  args is as function', () => {
    const order = create();
    order.addModuleCallFunction('a', 'f1', {
      context: {},
      args: [ () => { console.info('hellos'); } ],
    });
    try {
      order.verify(obj => {
        const { a } = obj;
        a.f1();
      });
    } catch (err) {
      console.info(err);
      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.f1(() => { console.info('hellos'); });   a.f1();  <-- args is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });
  it('test callInfo  args is object  it has function', () => {
    const order = create();
    order.addModuleCallFunction('a', 'f1', {
      context: {},
      args: [ {
        f1: () => { console.info('hellos'); },
        f2 () {

        },
      } ],
    });
    try {
      order.verify(obj => {
        const { a } = obj;
        a.f1();
      });
    } catch (err) {
      console.info(err);
      expect(err.message).to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.f1({"f1":"() => { console.info('hellos'); }","f2":"f2() {\\n\\n        }"});   a.f1();  <-- args is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });
});
