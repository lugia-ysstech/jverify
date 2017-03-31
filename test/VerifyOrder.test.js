/**
 * Created by liguoxin on 2017/3/1.
 */
const chai = require('chai');
const { create } = require('../dist/VerifyOrder');
chai.should();
const { expect } = chai;


describe('MockModule', function () {

  it('test addModuleCallFunction', () => {
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
      args: [ 1 ],
    });

    order.addModuleCallFunction('b', 'bf1', {
      context: B,
      args: [ 1, 2 ],
    });

    order.addModuleCallFunction('c', 'cf1', {
      context: C,
      args: [ 1, 2, 3 ],
    });


    const { a, b, c } = order.getMock();
    a.af1(1).withContext(A);
    a.af1(1).withContext(A);
    b.bf1(1, 2).withContext(B);
    c.cf1(1, 2, 3).withContext(C);
  });
  it('test addModuleVar', () => {
    const order = create();

    order.addModuleVar('a', 'v1');
    order.addModuleVar('b', 'v1');
    order.addModuleVar('a', 'v1');
    order.addModuleVar('c', 'v1');


    const { a, b, c } = order.getMock();
    a.v1.should.to.be.true;
    b.v1.should.to.be.true;
    a.v1.should.to.be.true;
    c.v1.should.to.be.true;
  });
  it('test addCallFunction', () => {
    const order = create(),
      A = {}, B = {}, C = {};

    order.addCallFunction('a', {
      context: A,
      args: [ 1, 2, 3 ],
    });
    order.addCallFunction('b', {
      context: C,
      args: [ 11 ],
    });
    order.addCallFunction('a', {
      context: B,
      args: [ 13 ],
    });
    order.addCallFunction('c', {
      context: A,
      args: [ 'a', 'b' ],
    });


    const { a, b, c } = order.getMock();
    a(1, 2, 3).withContext(A);
    b(11).withContext(C);
    a(13).withContext(B);
    c('a', 'b').withContext(A);
  });

});
