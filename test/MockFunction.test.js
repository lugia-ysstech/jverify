/**
 * Created by liguoxin on 2017/3/1.
 */
const chai = require('chai');
const { mockFunction } = require('../dist/index');
const { create } = mockFunction;
const { expect } = chai;
chai.should();


describe('MockFunction', function () {


  it('test mock function callTimes', () => {

    const mockFunction = create(() => 100);

    const targetFunc = mockFunction.getFunction();
    targetFunc();
    targetFunc();
    targetFunc();
    mockFunction.callTimes().should.to.be.equal(3);
  });

  it('test mock function returned', () => {

    const mockFunction = create();

    const targetFunc = mockFunction.getFunction();
    mockFunction.returned(101);
    mockFunction.returned(102);
    targetFunc().should.to.be.equal(101);
    targetFunc().should.to.be.equal(102);
  });

  it('test mock function mock', () => {

    const mockFunction = create();

    const targetFunc = mockFunction.getFunction();

    mockFunction.mock(a => {
      return 2 * a;
    });

    targetFunc(5).should.to.be.equal(10);
    targetFunc(10).should.to.be.equal(20);
  });

  it('test mock function returned higher mock', () => {

    const mockFunction = create(() => 100);
    const targetFunc = mockFunction.getFunction();
    mockFunction.returned(1);
    mockFunction.returned(2);
    mockFunction.mock(a => {
      return 2 * a;
    });

    targetFunc(5).should.to.be.equal(1);
    targetFunc(5).should.to.be.equal(2);
    targetFunc(5).should.to.be.equal(10);
    targetFunc(10).should.to.be.equal(20);
  });

  it('test mock function anonymous', () => {

    const mockFunction = create();
    const targetFunc = mockFunction.getFunction();
    mockFunction.returned(2);

    targetFunc(5).should.to.be.equal(2);
  });


  it('test mock function queryCallArg', () => {

    const mockFunction = create();
    const targetFunc = mockFunction.getFunction();
    const argOne = [ 1, false ];
    const argTwo = [ 1, 'a' ];
    const argThree = [ 3, new Date(), {} ];
    targetFunc(...argOne);
    targetFunc(...argTwo);
    targetFunc(...argThree);

    mockFunction.queryCallArgs().should.to.be.eql([ argOne, argTwo, argThree ]);
    mockFunction.getCallArgs(0).should.to.be.eql(argOne);
    mockFunction.getCallArgs(1).should.to.be.eql(argTwo);
    mockFunction.getCallArgs(2).should.to.be.eql(argThree);

  });

  it('test mock function queryCallContext', () => {

    const func = function () {

    };
    const obj = {};
    const mockFunction = create(func);
    const targetFunc = mockFunction.getFunction();
    targetFunc.call(obj);

    mockFunction.queryCallContext().should.to.be.eql([ obj ]);
    mockFunction.getCallContext(0).should.to.be.eql(obj);
  });


  it('test mock function mock ctx', () => {

    const mockFunction = create();
    const targetFunc = mockFunction.getFunction();
    const obj = {
      name: 'test',
    };

    mockFunction.mock(function () {
      return this.name;
    }, obj);

    targetFunc().should.to.be.equal(obj.name);
    mockFunction.getCallContext(0).should.to.be.eql(obj);
  });
  it('test mock function mock ctx for returned is same to mock', () => {

    const mockFunction = create();
    const targetFunc = mockFunction.getFunction();
    const obj = {
      name: 'test',
    };

    mockFunction.mock(function () {
      return this.name;
    }, obj);
    mockFunction.returned(100);
    targetFunc();
    targetFunc();
    mockFunction.getCallContext(0).should.to.be.eql(obj);
  });


  it('test mock function restore', () => {

    const mockFunction = create();
    const targetFunc = mockFunction.getFunction();
    mockFunction.mock(() => 1);
    targetFunc();
    targetFunc();
    targetFunc();
    mockFunction.returned(1);
    mockFunction.restore();
    mockFunction.queryCallArgs().should.to.be.eql([]);
    mockFunction.queryCallContext().should.to.be.eql([]);
    mockFunction.callTimes().should.to.be.equal(0);
  });
});
