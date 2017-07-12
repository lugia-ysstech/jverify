/**
 * Created by liguoxin on 2017/3/1.
 * @flow
 */
import type { CallInfo } from 'vx-mock';
const chai = require('chai');
const { mockFunction, VerifyOrder } = require('../lib/index');
const { create } = mockFunction;
const { expect } = chai;


describe('MockFunction', function () {

  it('test mock function callTimes', () => {

    const mockFunction = create();

    const targetFunc = mockFunction.getFunction();
    targetFunc();
    targetFunc();
    targetFunc();
    expect(mockFunction.callTimes()).to.be.equal(3);
  });

  it('test mock function returned', () => {

    const mockFunction = create();

    const targetFunc = mockFunction.getFunction();
    mockFunction.returned(101);
    mockFunction.returned(102);
    expect(targetFunc()).to.be.equal(101);
    expect(targetFunc()).to.be.equal(102);
  });
  it('test mock function delayReturned', async () => {

    const mockFunction = create();

    const targetFunc = mockFunction.getFunction();
    mockFunction.delayReturned(101, 50);
    mockFunction.delayReturned(102, 50);
    expect(await targetFunc()).to.be.equal(101);
    expect(await targetFunc()).to.be.equal(102);
  });

  it('test mock function forever', () => {

    const mockFunction = create();

    const targetFunc = mockFunction.getFunction();
    mockFunction.forever(101);
    expect(targetFunc()).to.be.equal(101);
    expect(targetFunc()).to.be.equal(101);
    expect(targetFunc()).to.be.equal(101);
    expect(targetFunc()).to.be.equal(101);
  });

  it('test mock function mock', () => {

    const mockFunction = create();

    const targetFunc = mockFunction.getFunction();

    mockFunction.mock(a => {
      return 2 * a;
    });

    expect(targetFunc(5)).to.be.equal(10);
    expect(targetFunc(10)).to.be.equal(20);
  });

  it('test mock function returned higher mock', () => {

    const mockFunction = create();
    const targetFunc = mockFunction.getFunction();
    mockFunction.returned(1);
    mockFunction.returned(2);
    mockFunction.mock(a => {
      return 2 * a;
    });

    expect(targetFunc(5)).to.be.equal(1);
    expect(targetFunc(5)).to.be.equal(2);
    expect(targetFunc(5)).to.be.equal(10);
    expect(targetFunc(10)).to.be.equal(20);
  });

  it('test mock function anonymous', () => {

    const mockFunction = create();
    const targetFunc = mockFunction.getFunction();
    mockFunction.returned(2);

    expect(targetFunc(5)).to.be.equal(2);
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

    expect(mockFunction.queryCallArgs()).to.be.eql([ argOne, argTwo, argThree ]);
    expect(mockFunction.getCallArgs(0)).to.be.eql(argOne);
    expect(mockFunction.getCallArgs(1)).to.be.eql(argTwo);
    expect(mockFunction.getCallArgs(2)).to.be.eql(argThree);

  });

  it('test mock function queryCallContext', () => {

    const obj = {};
    const mockFunction = create();
    const targetFunc = mockFunction.getFunction();
    targetFunc.call(obj);

    expect(mockFunction.queryCallContext()).to.be.eql([ obj ]);
    expect(mockFunction.getCallContext(0)).to.be.eql(obj);
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

    expect(targetFunc()).to.be.equal(obj.name);
    expect(mockFunction.getCallContext(0)).to.be.eql(obj);
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
    expect(mockFunction.getCallContext(0)).to.be.eql(obj);
  });


  it('test mock function restore', () => {

    const mockFunction = create();
    const targetFunc = mockFunction.getFunction();
    mockFunction.mock(() => 1);
    targetFunc();
    targetFunc();
    targetFunc();
    mockFunction.returned(1);
    mockFunction.forever('hello');
    mockFunction.restore();
    expect(mockFunction.queryCallArgs()).to.be.eql([]);
    expect(mockFunction.queryCallContext()).to.be.eql([]);
    expect(mockFunction.callTimes()).to.be.equal(0);
  });

  it('if verifyOrder is notEmpty mockName must had', () => {
    expect(() => {
      create({ mockName: '', verifyOrder: VerifyOrder.create() });
    }).throw(Error, '开启VerifyOrder，mockName不能为空!');
  });
  it('mock f1 has call addCallFunction', done => {


    const mockObj = create({
      mockName: 'a', verifyOrder: {
        addCallFunction (mockName) {
          expect(mockName).to.be.equal('a');
          done();
        },
        addModuleCallFunction (mockName: string, funcName: string, callInfo: ?CallInfo): void {

        },
        addModuleVar (mockName: string, attrName: string): void {

        },
        verify (callback: Function): void {

        },
      },
    });

    mockObj.getFunction()();

  });


});
