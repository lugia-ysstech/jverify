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
    order.addModuleVar('b', 'b1');
    order.addModuleVar('b', 'b2');
    order.addModuleVar('c', 'c1');
    order.addModuleVar('b', 'b3');

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
1.  a.af1(1);          <-- a.dd is not a function & step is error
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
      });

    } catch (err) {
      console.info(err);
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.af1(1);           a.af1(1);
2.  a.af1(1, 4);        a.af1(1, 4);
3.  b.bf1(1, 2);        b.bf1(2, 3);  <-- args is error
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
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.af1(1);           a.af1(1);
2.  a.af1(1, 4);        a.af1(1, 4);
3.  b.bf1(1, 2);        b.bf1(1, 2);
4.  c 1.cf1(1, 2, 3);  <-- obj.c 1.a is not a function & step is error`);
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

  it('test addModuleCallFunction error  expected is less then actuly', () => {
    //     const { order } = mockModuleVar();
    //     try {
    //       order.verify(obj => {
    //         const { a, b,c } = obj;
    //         a.a1;
    //       });
    //
    //     } catch (err) {
    //       console.info(err);
    //       err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
    // 1.  a.af1(1);           a.af1(1);
    // 2.  a.af1(1, 4);        a.af1(1, 2);  <-- args & context is error
    // 3.  b.bf1(1, 2);        b.bf1(1, 4);  <-- args & context is error
    // 4.  c 1.cf1(1, 2, 3);  <-- step is error`);
    //       return;
    //     }
    //     assert.isOk(false, '未正取识别错误顺序');
  });

  it('test addModuleVar error  expected is less then actuly', () => {
    const { A, B, order } = mockModuleFunc();
    try {
      order.verify(obj => {
        const { a, b } = obj;
        a.af1(1).withContext(A);
        a.af1(1, 2).withContext(B);
        b.bf1(1, 4).withContext(A);
      });

    } catch (err) {
      console.info(err);
      err.message.should.to.be.equal(`验证失败，左边为实际调用顺序，右边为期望调用顺序
1.  a.af1(1);           a.af1(1);
2.  a.af1(1, 4);        a.af1(1, 2);  <-- args & context is error
3.  b.bf1(1, 2);        b.bf1(1, 4);  <-- args & context is error
4.  c 1.cf1(1, 2, 3);  <-- step is error`);
      return;
    }
    assert.isOk(false, '未正取识别错误顺序');
  });

  //
  // it('test addModuleVar', () => {
  //   const order = create();
  //
  //   order.addModuleVar('a', 'v1');
  //   order.addModuleVar('b', 'v1');
  //   order.addModuleVar('a', 'v1');
  //   order.addModuleVar('c', 'v1');
  //
  //
  //   const { a, b, c } = order.getMock();
  //   a.v1.should.to.be.true;
  //   b.v1.should.to.be.true;
  //   a.v1.should.to.be.true;
  //   c.v1.should.to.be.true;
  // });
  // it('test addCallFunction', () => {
  //   const order = create(),
  //     A = {},
  //     B = {},
  //     C = {};
  //
  //   order.addCallFunction('a', {
  //     context: A,
  //     args: [ 1, 2, 3 ],
  //   });
  //   order.addCallFunction('b', {
  //     context: C,
  //     args: [ 11 ],
  //   });
  //   order.addCallFunction('a', {
  //     context: B,
  //     args: [ 13 ],
  //   });
  //   order.addCallFunction('c', {
  //     context: A,
  //     args: [ 'a', 'b' ],
  //   });
  //
  //
  //   const { a, b, c } = order.getMock();
  //   a(1, 2, 3).withContext(A);
  //   b(11).withContext(C);
  //   a(13).withContext(B);
  //   c('a', 'b').withContext(A);
  // });

});
