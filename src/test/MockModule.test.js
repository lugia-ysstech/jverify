/**
 * Created by liguoxin on 2017/3/1.
 * @flow
 */
const chai = require('chai');
const { mockObject, VerifyOrder } = require('../lib/index');
const { create } = mockObject;
const { expect } = chai;


describe('MockModule', function () {

  it('create param is Error', () => {
    expect(() => {
      create();
    }).throw(Error, 'mock的目标对象不能为空!');
  });

  it('mockFunction', () => {
    const before = 'lily';
    const user = {
      getName () {
        return before;
      },
    };
    const userMock = create(user);
    const mockFunc = userMock.mockFunction('getName');
    expect(user.getName()).to.be.equal(before);

    const after = 'Ligx';
    mockFunc.mock(() => {
      return after;
    });
    expect(user.getName()).to.be.equal(after);
  });

  it('mockFunction restore', () => {
    const obj = {
      getValue () {
        return 100;
      },
    };
    const mock = create(obj).mockFunction('getValue');

    expect(obj.getValue()).to.be.equal(100);
    mock.returned(101);
    mock.mock(() => 1000);
    mock.restore();

    // 状态还原
    expect(mock.queryCallArgs()).to.be.eql([]);
    expect(mock.queryCallContext()).to.be.eql([]);
    expect(mock.callTimes()).to.be.equal(0);
    // 模拟值还原
    expect(obj.getValue()).to.be.equal(100);

  });
  it('mockFunction mockContext', () => {
    const obj = {
      value: 100,
      getValue () {
        return this.value;
      },
    };
    const mock = create(obj).mockFunction('getValue');
    mock.mockContext({
      value: 101,
    });
    expect(obj.getValue()).to.be.equal(101);
  });
  it('mockFunction mockContext after restore', () => {
    const obj = {
      value: 100,
      getValue () {
        return this.value;
      },
    };
    const mock = create(obj).mockFunction('getValue');
    mock.mockContext({
      value: 101,
    });
    mock.restore();
    expect(obj.getValue()).to.be.equal(100);
  });


  it('mockFunction has param', () => {
    const user = {
      add (a, b) {
        return a + b;
      },
    };
    const userMock = create(user);
    const mockAdd = userMock.mockFunction('add');
    expect(user.add(1, 2)).to.be.equal(3);
    mockAdd.mock((a, b) => {
      return a - b;
    });
    expect(user.add(2, 3)).to.be.equal(-1);
  });

  it('mockFunction callTimes ', () => {
    const user = {
      add () {
      },
    };
    const userMock = create(user);
    const mockAdd = userMock.mockFunction('add');
    user.add();
    user.add();
    user.add();
    expect(mockAdd.callTimes()).to.be.equal(3);
  });

  it('mockFunction verify CallArgs', () => {
    const user = {
      add (a /* : any*/, b /* : any*/) {
        console.info(a, b);
      },
    };
    const userMock = create(user);
    const mockAdd = userMock.mockFunction('add');
    const callArgs = [ [ 1, 2 ], [ 'a', false ], [ new Date(), {} ] ];
    user.add(...callArgs[ 0 ]);
    user.add(...callArgs[ 1 ]);
    user.add(...callArgs[ 2 ]);
    mockAdd.mock(() => 10);
    expect(mockAdd.queryCallArgs()).to.be.eql(callArgs);
    expect(mockAdd.getCallArgs(0)).to.be.eql(callArgs[ 0 ]);
    expect(mockAdd.getCallArgs(1)).to.be.eql(callArgs[ 1 ]);
    expect(mockAdd.getCallArgs(2)).to.be.eql(callArgs[ 2 ]);
  });

  it('mockFunction verify CallContext', () => {
    const user = {
      add () {
      },
    };
    const userMock = create(user);
    const mockAdd = userMock.mockFunction('add');
    user.add();
    user.add();
    mockAdd.mock(() => 10);
    expect(mockAdd.queryCallContext()[ 0 ]).to.be.equal(user);
    expect(mockAdd.queryCallContext()[ 1 ]).to.be.equal(user);
    expect(mockAdd.getCallContext(0)).to.be.equal(user);
    expect(mockAdd.getCallContext(1)).to.be.equal(user);
    // 指定context
    const ctx = { user: '111' };
    mockAdd.mock(() => 10, ctx);
    user.add();
    expect(mockAdd.queryCallContext()[ 2 ]).to.be.equal(ctx);

    mockAdd.mock(() => 10);
    user.add();
    expect(mockAdd.queryCallContext()[ 3 ]).to.be.equal(user);

  });

  it('mockFunction verify CallContext returned context is same to mock', () => {
    const user = {
      add () {

      },
    };
    const userMock = create(user);
    const mockAdd = userMock.mockFunction('add');
    const obj = {};

    mockAdd.mock(() => 1, obj);
    user.add();
    expect(mockAdd.getCallContext(0)).to.be.equal(obj);
    mockAdd.returned('hello');
    mockAdd.returned('hello');
    user.add();
    user.add();
    expect(mockAdd.getCallContext(1)).to.be.equal(obj);
    expect(mockAdd.getCallContext(2)).to.be.equal(obj);
  });


  it('mockFunction returned highter mock', () => {
    const user = {
      add (a: any, b: any) {
        console.info(a, b);
      },
    };
    const userMock = create(user);
    const mockAdd = userMock.mockFunction('add');
    mockAdd.returned(100);
    mockAdd.returned(101);
    mockAdd.mock(() => {
      return 'hello';
    });

    expect(user.add('1', 'b')).to.be.equal(100);
    expect(user.add('1', 'b')).to.be.equal(101);
    expect(user.add('1', 'b')).to.be.equal('hello');
  });


  it('mockFunction returned ', () => {
    class Test {
      func () {
        return this.ds();
      }

      ds () {

      }
    }
    const target = new Test();

    const order = VerifyOrder.create();

    const mockObj = create(target, { mockName: 'target', verifyOrder: order });

    const funcMock = mockObj.mockFunction('ds');
    funcMock.returned(1);
    funcMock.returned(2);
    funcMock.returned(3);

    expect(target.func()).to.be.equal(1);
    expect(target.func()).to.be.equal(2);
    expect(target.func()).to.be.equal(3);
  });

  it('mockFunction delayReturned ', async () => {
    class Test {
      func () {
        return this.ds();
      }

      ds () {

      }
    }
    const target = new Test();

    const order = VerifyOrder.create();

    const mockObj = create(target, { mockName: 'target', verifyOrder: order });

    const funcMock = mockObj.mockFunction('ds');
    const timeout1 = 50;
    const timeout2 = 80;
    const timeout3 = 150;
    funcMock.delayReturned(1, timeout1);
    funcMock.delayReturned(2, timeout2);
    funcMock.delayReturned(3, timeout3);
    const time = new Date();
    expect(await target.func()).to.be.equal(1);
    expect(new Date() - time >= timeout1).to.be.true;
    expect(await target.func()).to.be.equal(2);
    expect(new Date() - time >= timeout2).to.be.true;
    expect(await target.func()).to.be.equal(3);
    expect(new Date() - time >= timeout3).to.be.true;
  });

  it('mockFunction forever ', () => {
    class Test {
      f1 () {}
    }
    const target = new Test();

    const order = VerifyOrder.create();

    const mockObj = create(target, { mockName: 'target', verifyOrder: order });

    const funcMock = mockObj.mockFunction('f1');
    funcMock.forever(1000);

    expect(target.f1()).to.be.equal(1000);
    expect(target.f1()).to.be.equal(1000);
    expect(target.f1()).to.be.equal(1000);
    expect(target.f1()).to.be.equal(1000);
    expect(target.f1()).to.be.equal(1000);
  });

  it('mockFunction restore for forever', () => {
    const old = 10;
    const forever = 11;
    const obj = {
      f1 () { return old; },
    };
    const userMock = create(obj);
    const mockVar = userMock.mockFunction('f1');
    mockVar.forever(forever);
    expect(obj.f1()).to.be.equal(forever);
    mockVar.restore();
    expect(obj.f1()).to.be.equal(old);
  });

  it('mockFunction forever highter than any', () => {
    const old = 10;
    const forever = 11;
    const obj = {
      f1 () { return old; },
    };
    const userMock = create(obj);
    const mockVar = userMock.mockFunction('f1');
    mockVar.returned(1);
    mockVar.returned(2);
    mockVar.mock(() => 100);
    mockVar.forever(forever);
    expect(obj.f1()).to.be.equal(forever);
  });
  it('mockVar', () => {
    const obj = {
      age: 15,
    };
    const userMock = create(obj);
    const mockVar = userMock.mockVar('age');
    expect(obj.age).to.be.equal(15);
    const result = 1000;
    mockVar.mock(() => result);
    expect(obj.age).to.be.equal(result);

  });
  it('mockVar calltimes', () => {
    const obj = {
      age: 15,
    };
    const userMock = create(obj);
    const mockVar = userMock.mockVar('age');
    obj.age;
    obj.age;
    obj.age;
    obj.age;
    expect(mockVar.callTimes()).to.be.equal(4);

  });

  it('mockVar restore', () => {
    const obj = {
      age: 15,
    };
    const userMock = create(obj);
    const mockVar = userMock.mockVar('age');
    obj.age;
    obj.age;
    obj.age;
    mockVar.mock(() => 1);
    mockVar.returned('a');

    mockVar.restore();
    // 状态还原
    expect(mockVar.callTimes()).to.be.equal(0);
    // 模拟值还原
    expect(obj.age).to.be.equal(15);
  });


  it('mockVar has returned', () => {
    const obj = {
      age: 15,
    };
    const userMock = create(obj);
    expect(obj.age).to.be.equal(15);
    const mockVar = userMock.mockVar('age');
    mockVar.returned(17);
    mockVar.returned(16);
    expect(obj.age).to.be.equal(17);
    expect(obj.age).to.be.equal(16);

  });


  it('mockVar has returned highter than mock', () => {
    const obj = {
      age: 15,
    };
    const userMock = create(obj);
    const mockVar = userMock.mockVar('age');
    mockVar.mock(() => 18);
    mockVar.returned(17);
    mockVar.returned(16);
    expect(obj.age).to.be.equal(17);
    expect(obj.age).to.be.equal(16);
    expect(obj.age).to.be.equal(18);

  });


  it('if verifyOrder is notEmpty mockName must had', () => {
    expect(() => {
      create({}, { mockName: '', verifyOrder: VerifyOrder.create() });
    }).throw(Error, '开启VerifyOrder，mockName不能为空!');
  });

  it('mockFunction obj.v has call addModuleVar', done => {

    const target = { v: '111' };

    const order = {
      addModuleVar (mockName, attrName) {
        expect(mockName).to.be.equal('a');
        expect(attrName).to.be.equal('v');
        done();
      },
    };

    const mockObj = create(target, {
      mockName: 'a', verifyOrder: Object.assign({}, VerifyOrder.create(), order),
    });
    mockObj.mockVar('v');

    target.v;

  });

  it('mock obj.func has call addModuleCallFunction', done => {

    const target = { f1 () {} };

    const order = {
      addModuleCallFunction (mockName, attrName) {
        expect(mockName).to.be.equal('a');
        expect(attrName).to.be.equal('f1');
        done();
      },
    };

    const mockObj = create(target, {
      mockName: 'a', verifyOrder: Object.assign({}, VerifyOrder.create(), order),
    });
    mockObj.mockFunction('f1');

    target.f1();

  });

  it('restoreAll', () => {
    const target = {
      f1 () { return 1; },
      f2 () { return 2; },
      a1: 'old',
    };
    const mockObj = create(target);
    mockObj.mockFunction('f1').returned(3);
    mockObj.mockFunction('f2').returned(4);
    mockObj.mockVar('a1').returned('new');

    mockObj.restoreAll();

    expect(target.f1()).to.be.equal(1);
    expect(target.f2()).to.be.equal(2);
    expect(target.a1).to.be.equal('old');

    mockObj.mockFunction('f1').returned(3);
    mockObj.mockFunction('f2').returned(4);

    //  mock对象仍可以继续使用
    mockObj.mockVar('a1').returned('new');
    expect(target.f1()).to.be.equal(3);
    expect(target.f2()).to.be.equal(4);
    expect(target.a1).to.be.equal('new');

    // restoreAll 可重复使用
    mockObj.restoreAll();

    expect(target.f1()).to.be.equal(1);
    expect(target.f2()).to.be.equal(2);
    expect(target.a1).to.be.equal('old');
  });

  it('mockVar returned ', () => {
    class Test {
      num: number;

      constructor (num: number) {
        this.num = num;
      }
    }
    const target = new Test(1);

    const order = VerifyOrder.create();

    const mockObj = create(target, { mockName: 'target', verifyOrder: order });

    const funcMock = mockObj.mockVar('num');
    funcMock.returned(1);
    funcMock.returned(2);
    funcMock.returned(3);

    expect(target.num).to.be.equal(1);
    expect(target.num).to.be.equal(2);
    expect(target.num).to.be.equal(3);
  });
  it('mockVar delayReturned ', async () => {
    class Test {
      num: number;

      constructor (num: number) {
        this.num = num;
      }
    }
    const target = new Test(1);

    const order = VerifyOrder.create();

    const mockObj = create(target, { mockName: 'target', verifyOrder: order });

    const funcMock = mockObj.mockVar('num');
    const timeout1 = 50;
    const timeout2 = 80;
    const timeout3 = 150;
    funcMock.delayReturned(1, timeout1);
    funcMock.delayReturned(2, timeout2);
    funcMock.delayReturned(3, timeout3);
    const time = new Date();
    expect(await target.num).to.be.equal(1);
    expect(new Date() - time >= timeout1).to.be.true;
    expect(await target.num).to.be.equal(2);
    expect(new Date() - time >= timeout2).to.be.true;
    expect(await target.num).to.be.equal(3);
    expect(new Date() - time >= timeout3).to.be.true;
  });

  it('mockVar forever ', () => {
    class Test {
      /* :: num:number;*/
      constructor (num /* : number*/) {
        this.num = num;
      }
    }
    const target = new Test(1);

    const order = VerifyOrder.create();

    const mockObj = create(target, { mockName: 'target', verifyOrder: order });

    const funcMock = mockObj.mockVar('num');
    funcMock.forever(1000);

    expect(target.num).to.be.equal(1000);
    expect(target.num).to.be.equal(1000);
    expect(target.num).to.be.equal(1000);
    expect(target.num).to.be.equal(1000);
    expect(target.num).to.be.equal(1000);
  });

  it('mockVar restore for forever', () => {
    const obj = {
      age: 15,
    };
    const userMock = create(obj);
    const mockVar = userMock.mockVar('age');
    obj.age;
    mockVar.forever('a');
    mockVar.restore();
    expect(obj.age).to.be.equal(15);
  });

  it('mockVar forever highter than any', () => {
    const obj = {
      age: 15,
    };
    const userMock = create(obj);
    const mockVar = userMock.mockVar('age');
    obj.age;
    mockVar.returned(1);
    mockVar.returned(2);
    mockVar.mock(() => 100);
    mockVar.forever('a');
    expect(obj.age).to.be.equal('a');
  });

  it('mockFunction reset', () => {
    const obj = {
      f1 () {

      },
    };
    const myName = 'f1';
    obj.f1.myName = myName;

    const objMock = create(obj);
    const mockFunction = objMock.mockFunction(myName);

    expect(obj.f1.myName).to.be.undefined;
    mockFunction.reset();
    expect(obj.f1.myName).to.be.equal(myName);
  });
  it('mockFunction reset after if mock is Error', () => {
    const obj = {
      f1 () {

      },
    };
    const myName = 'f1';
    obj.f1.myName = myName;

    const objMock = create(obj);
    const mockFunction = objMock.mockFunction(myName);
    mockFunction.reset();
    expect(() => {
      mockFunction.returned(1);
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      mockFunction.delayReturned(1, 500);
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      mockFunction.mock(() => 100);
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      mockFunction.forever(101);
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      mockFunction.queryCallArgs();
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      mockFunction.getCallArgs(1);
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      mockFunction.queryCallContext();
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      mockFunction.getCallContext(1);
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      mockFunction.restore();
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      mockFunction.callTimes();
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      mockFunction.mockContext({});
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      mockFunction.reset();
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
  });


  it('resetAll', () => {
    const obj = {
      f1 () {

      },
      f2 () {

      },
    };
    const myName = 'f1';
    obj.f1.myName = myName;
    obj.f2.myName = myName;
    const objMock = create(obj);
    objMock.mockFunction('f1');
    objMock.mockFunction('f2');

    expect(obj.f1.myName).to.be.undefined;
    expect(obj.f2.myName).to.be.undefined;
    objMock.resetAll();

    expect(obj.f1.myName).to.be.equal(myName);
    expect(obj.f2.myName).to.be.equal(myName);
  });

  it('resetAll after need check ', () => {
    const obj = {
      f1 () {

      },
      f2 () {

      },
    };
    const objMock = create(obj);
    const f1Mock = objMock.mockFunction('f1');
    f1Mock.forever(100);
    expect(obj.f1()).to.be.equal(100);
    objMock.resetAll();

    expect(() => {
      f1Mock.mock(() => {});
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      f1Mock.queryCallArgs();
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      f1Mock.getCallArgs(0);
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      f1Mock.returned(100);
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      f1Mock.queryCallContext();
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      f1Mock.getCallContext(0);
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      f1Mock.restore();
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      f1Mock.callTimes();
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      f1Mock.mockContext({});
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
    expect(() => {
      f1Mock.error('hll');
    }).throw(Error, 'mockFunction已被reset，请重新调用mockFunction方法!');
  });

  it('mockFunction error for string type', () => {
    const obj = {
      f1 () {

      },
    };
    const objMock = create(obj);
    const f1Mock = objMock.mockFunction('f1');
    const errMsg = 'hello error';
    f1Mock.error(errMsg);
    expect(() => {
      obj.f1();
    }).throw(Error, errMsg);
  });

  it('mockFunction error for Error Type', () => {
    const obj = {
      f1 () {

      },
    };
    const objMock = create(obj);
    const f1Mock = objMock.mockFunction('f1');
    const errMsg = 'hello error';
    f1Mock.error(new Error(errMsg));
    expect(() => {
      obj.f1();
    }).throw(Error, errMsg);
  });


  it('mockVar error for string type', () => {
    const obj = {
      name: 'hello',
    };
    const objMock = create(obj);
    const nameMock = objMock.mockVar('name');
    const errMsg = 'hello error';
    nameMock.error(errMsg);
    expect(() => {
      obj.name;
    }).throw(Error, errMsg);
  });
  it('mockVar error for Error type', () => {
    const obj = {
      name: 'hello',
    };
    const objMock = create(obj);
    const nameMock = objMock.mockVar('name');
    const errMsg = 'hello error';
    nameMock.error(new Error(errMsg));
    expect(() => {
      obj.name;
    }).throw(Error, errMsg);
  });

});
