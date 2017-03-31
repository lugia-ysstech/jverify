/**
 * Created by liguoxin on 2017/3/1.
 */
const chai = require('chai');
const { mockObject } = require('../dist/index');
const { create } = mockObject;
chai.should();
const { expect } = chai;


describe('MockModule', function () {

  it('create param is Error', () => {
    expect(() => {
      create();
    }).throw(Error, 'mock的目标对象不能为空!');
  });

  it('mock func', () => {
    const before = 'lily';
    const user = {
      getName () {
        return before;
      },
    };
    const userMock = create(user);
    const mockFunc = userMock.mockFunction('getName');
    user.getName().should.to.be.equal(before);

    const after = 'Ligx';
    mockFunc.mock(() => {
      return after;
    });
    user.getName().should.to.be.equal(after);
  });

  it('mock func restore', () => {
    const obj = {
      getValue () {
        return 100;
      },
    };
    const mock = create(obj).mockFunction('getValue');

    obj.getValue().should.to.be.equal(100);
    mock.returned(101);
    mock.mock(() => 1000);
    mock.restore();

    // 状态还原
    mock.queryCallArgs().should.to.be.eql([]);
    mock.queryCallContext().should.to.be.eql([]);
    mock.callTimes().should.to.be.equal(0);
    // 模拟值还原
    obj.getValue().should.to.be.equal(100);

  });


  it('test mock func has param', () => {
    const user = {
      add (a, b) {
        return a + b;
      },
    };
    const userMock = create(user);
    const mockAdd = userMock.mockFunction('add');
    user.add(1, 2).should.to.be.equal(3);
    mockAdd.mock((a, b) => {
      return a - b;
    });
    user.add(2, 3).should.to.be.equal(-1);
  });

  it('test mock func callTimes ', () => {
    const user = {
      add () {
      },
    };
    const userMock = create(user);
    const mockAdd = userMock.mockFunction('add');
    user.add();
    user.add();
    user.add();
    mockAdd.callTimes().should.to.be.equal(3);
  });

  it('test mock func verify CallArgs', () => {
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
    mockAdd.queryCallArgs().should.to.be.eql(callArgs);
    mockAdd.getCallArgs(0).should.to.be.eql(callArgs[ 0 ]);
    mockAdd.getCallArgs(1).should.to.be.eql(callArgs[ 1 ]);
    mockAdd.getCallArgs(2).should.to.be.eql(callArgs[ 2 ]);
  });

  it('test mock func verify CallContext', () => {
    const user = {
      add () {
      },
    };
    const userMock = create(user);
    const mockAdd = userMock.mockFunction('add');
    user.add();
    user.add();
    mockAdd.mock(() => 10);
    mockAdd.queryCallContext()[ 0 ].should.to.be.equal(user);
    mockAdd.queryCallContext()[ 1 ].should.to.be.equal(user);
    mockAdd.getCallContext(0).should.to.be.equal(user);
    mockAdd.getCallContext(1).should.to.be.equal(user);
    // 指定context
    const ctx = { user: '111' };
    mockAdd.mock(() => 10, ctx);
    user.add();
    mockAdd.queryCallContext()[ 2 ].should.to.be.equal(ctx);

    mockAdd.mock(() => 10);
    user.add();
    mockAdd.queryCallContext()[ 3 ].should.to.be.equal(user);

  });

  it('test mock func verify CallContext returned context is same to mock', () => {
    const user = {
      add () {

      },
    };
    const userMock = create(user);
    const mockAdd = userMock.mockFunction('add');
    const obj = {};

    mockAdd.mock(() => 1, obj);
    user.add();
    mockAdd.getCallContext(0).should.to.be.equal(obj);
    mockAdd.returned('hello');
    mockAdd.returned('hello');
    user.add();
    user.add();
    mockAdd.getCallContext(1).should.to.be.equal(obj);
    mockAdd.getCallContext(2).should.to.be.equal(obj);
  });


  it('test mock func returned highter mock', () => {
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

    user.add('1', 'b').should.to.be.equal(100);
    user.add('1', 'b').should.to.be.equal(101);
    user.add('1', 'b').should.to.be.equal('hello');

  });


  it('mock var', () => {
    const obj = {
      age: 15,
    };
    const userMock = create(obj);
    const mockVar = userMock.mockVar('age');
    obj.age.should.to.be.equal(15);
    mockVar.mock(18);
    obj.age.should.to.be.equal(18);

  });
  it('mock var calltimes', () => {
    const obj = {
      age: 15,
    };
    const userMock = create(obj);
    const mockVar = userMock.mockVar('age');
    obj.age;
    obj.age;
    obj.age;
    obj.age;
    mockVar.callTimes().should.to.be.equal(4);

  });

  it('mock var restore', () => {
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
    mockVar.callTimes().should.to.be.equal(0);
    // 模拟值还原
    obj.age.should.to.be.equal(15);
  });

  it('mock var has returned', () => {
    const obj = {
      age: 15,
    };
    const userMock = create(obj);
    obj.age.should.to.be.equal(15);
    const mockVar = userMock.mockVar('age');
    mockVar.returned(17);
    mockVar.returned(16);
    obj.age.should.to.be.equal(17);
    obj.age.should.to.be.equal(16);

  });


  it('mock var has returned higer than mock', () => {
    const obj = {
      age: 15,
    };
    const userMock = create(obj);
    const mockVar = userMock.mockVar('age');
    mockVar.mock(18);
    mockVar.returned(17);
    mockVar.returned(16);
    obj.age.should.to.be.equal(17);
    obj.age.should.to.be.equal(16);
    obj.age.should.to.be.equal(18);

  });


  it('if verifyOrder is notEmpty mockName must had', () => {
    expect(() => {
      create({}, null, {});
    }).throw(Error, '开启VerifyOrder，mockName不能为空!');
  });



});
