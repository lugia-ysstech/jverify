/**
 * Created by liguoxin on 2017/3/1.
 * @flow
 */
const chai = require('chai');
const { mockObject, VerifyOrder } = require('../dist/index');
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
      add () {
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
      add () {

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

    const order = VerifyOrder.create({});

    const mockObj = create(target, { mockName: 'target', verifyOrder: order });

    const funcMock = mockObj.mockFunction('ds');
    funcMock.returned(1);
    funcMock.returned(2);
    funcMock.returned(3);

    expect(target.func()).to.be.equal(1);
    expect(target.func()).to.be.equal(2);
    expect(target.func()).to.be.equal(3);
  });
  it('mockFunction forever ', () => {
    class Test {
      f1 () {}
    }
    const target = new Test(1);

    const order = VerifyOrder.create({});

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
    mockVar.mock(18);
    expect(obj.age).to.be.equal(18);

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
    mockVar.mock(1, {});
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
    mockVar.mock(18);
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
      /* :: num:number;*/
      constructor (num /* : number*/) {
        this.num = num;
      }
    }
    const target = new Test(1);

    const order = VerifyOrder.create({});

    const mockObj = create(target, { mockName: 'target', verifyOrder: order });

    const funcMock = mockObj.mockVar('num');
    funcMock.returned(1);
    funcMock.returned(2);
    funcMock.returned(3);

    expect(target.num).to.be.equal(1);
    expect(target.num).to.be.equal(2);
    expect(target.num).to.be.equal(3);
  });

  it('mockVar forever ', () => {
    class Test {
      /* :: num:number;*/
      constructor (num /* : number*/) {
        this.num = num;
      }
    }
    const target = new Test(1);

    const order = VerifyOrder.create({});

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

});
