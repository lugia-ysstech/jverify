/**
 * Created by liguoxin on 2017/3/1.
 */
const chai = require('chai');
const { create } = require('../dist/VerifyOrder');
chai.should();
const { expect, assert } = chai;


describe('MockModule', function () {


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
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.af1(1);           a.af1(1);
2.  a.af1(1, 4);        a.af1(1);  <-- args is error
3.  b.bf1(1, 2);        b.bf1(1, 2);
4.  c 1.cf1(1, 2, 3);   c 1.cf1(1, 2, 3);  <-- context is error`);
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
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
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
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.af1(1);          <-- a.dd is undefined & step is error
2.  a.af1(1, 4);       <-- step is error
3.  b.bf1(1, 2);       <-- step is error
4.  c 1.cf1(1, 2, 3);  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  it('test addModuleCallFunction error  func is undefined before is error', () => {
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
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.af1(1);           a.af1(1);
2.  a.af1(1, 4);        a.af1(1, 4);
3.  b.bf1(1, 2);        b.bf1(2, 3);  <-- args is error
4.  c 1.cf1(1, 2, 3);  <-- c 1.a is undefined & step is error`);
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
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
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
        const { a } = obj;
        a.af1(1);
        a.af1(1, 4);
        b.aaa();
        obj[ 'c 1' ].cf1(1, 2, 3);
      });

    } catch (err) {
      console.info(err);
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.af1(1);           a.af1(1);
2.  a.af1(1, 4);        a.af1(1, 4);
3.  b.bf1(1, 2);       <-- b is not defined & step is error
4.  c 1.cf1(1, 2, 3);  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });
  it('test addModuleCallFunction no any func called', () => {
    const { order } = mockModuleFunc();
    try {
      order.verify(obj => {
      });

    } catch (err) {
      console.info(err);
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
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
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
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

  it('test addModuleVar error  expected is less then actuly line 1 is error', () => {
    const { order } = mockModuleVar();
    try {
      order.verify(obj => {
        const { a } = obj;
        a.a2;
      });
    } catch (err) {
      console.info(err);
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
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
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
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
        const { a } = obj;
        b.a1;
      });
    } catch (err) {
      console.info(err);
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.a1;   <-- b is not defined & step is error
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
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
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
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
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


});
