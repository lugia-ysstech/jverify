/**
 * Created by liguoxin on 2017/3/1.
 */
const chai = require('chai');
const { mockObject } = require('../dist/index');
const { create } = mockObject;
chai.should();
const { expect } = chai;
const query = require('./Query');


describe('MockModule', function () {

  it('create param is Error', () => {
    expect(() => {
      create();
    }).throw(Error, 'mock的目标对象不能为空!');
  });

  it('mock func', () => {
    query.getName().should.to.be.equal('Lily');
    const userMock = create(require('./User'));
    const mockFunc = userMock.mockFunction('getName');
    const mockName = 'Ligx';
    mockFunc.mock(() => {
      return mockName;
    });
    query.getName().should.to.be.equal(mockName);
  });
  it('mock func restore', () => {
    const obj = {
      getValue () {
        return 100;
      },
    };
    const mock = create(obj).mockFunction('getValue');

    obj.getValue().should.to.be.equal(100);
    mock.returned(100);
    mock.returned(101);
    mock.mock(() => 1000);
    obj.getValue().should.to.be.equal(100);
  });


  it('mock var', () => {
    const userMock = create(require('./User'));
    const mockVar = userMock.mockVar('age');
    query.getAge().should.to.be.equal(15);
    mockVar.mock(18);

    query.getAge().should.to.be.equal(18);
    mockVar.restore();
    query.getAge().should.to.be.equal(15);
    mockVar.callTimes(2).should.to.be.equal(3);

  });

  it('mock var has returned', () => {
    const userMock = create(require('./User'));
    const mockVar = userMock.mockVar('age');
    query.getAge().should.to.be.equal(15);
    mockVar.returned(17);
    mockVar.returned(16);
    query.getAge().should.to.be.equal(17);
    query.getAge().should.to.be.equal(16);

  });


  it('mock var has returned higer than mock', () => {
    const userMock = create(require('./User'));
    const mockVar = userMock.mockVar('age');
    query.getAge().should.to.be.equal(15);
    mockVar.mock(18);
    mockVar.returned(17);
    mockVar.returned(16);
    query.getAge().should.to.be.equal(17);
    query.getAge().should.to.be.equal(16);
    query.getAge().should.to.be.equal(18);

  });

  it('test mock func has param', () => {
    const user = require('./User');
    const userMock = create(user);
    const mockAdd = userMock.mockFunction('add');
    query.add(1, 2).should.to.be.equal(3);
    mockAdd.mock((a, b) => {
      return a - b;
    });
    query.add(2, 3).should.to.be.equal(-1);
  });

  it('test mock func callTimes ', () => {
    const user = require('./User');
    const userMock = create(user);
    const mockAdd = userMock.mockFunction('add');
    query.add(1, 2);
    query.add(1, 2);
    query.add(1, 2);
    mockAdd.mock(() => 10);
    mockAdd.callTimes(2).should.to.be.equal(3);
  });

  it('test mock func verify CallArgs', () => {
    const user = require('./User');
    const userMock = create(user);
    const mockAdd = userMock.mockFunction('add');
    query.add(1, 2);
    query.add(2, 3);
    query.add(4, 5);
    mockAdd.mock(() => 10);
    mockAdd.queryCallArgs().should.to.be.eql([ [ 1, 2 ], [ 2, 3 ], [ 4, 5 ] ]);
    mockAdd.queryCallArgs()[ 0 ].should.to.be.equal(mockAdd.getCallArgs(0));
    mockAdd.queryCallArgs()[ 1 ].should.to.be.equal(mockAdd.getCallArgs(1));
  });
  it('test mock func verify CallContext', () => {
    const user = require('./User');
    const userMock = create(user);
    const mockAdd = userMock.mockFunction('add');
    query.add(1, 2);
    query.add(1, 2);
    mockAdd.mock(() => 10);
    mockAdd.queryCallContext()[ 0 ].should.to.be.equal(query);
    mockAdd.queryCallContext()[ 1 ].should.to.be.equal(query);
    mockAdd.queryCallContext()[ 0 ].should.to.be.equal(mockAdd.getCallContext(0));
    mockAdd.queryCallContext()[ 1 ].should.to.be.equal(mockAdd.getCallContext(1));
    // 指定context
    const ctx = { user: '111' };
    mockAdd.mock(() => 10, ctx);
    query.add(1, 2);
    mockAdd.queryCallContext()[ 0 ].should.to.be.equal(query);

  });
  it('test mock func has returned', () => {
    const userMock = create(require('./User'));
    const mockAdd = userMock.mockFunction('add');
    mockAdd.returned(100);
    mockAdd.returned(101);
    mockAdd.mock(() => {
      return 'hello';
    });

    query.add('1', 'b').should.to.be.equal(100);
    query.add('1', 'b').should.to.be.equal(101);
    query.add('1', 'b').should.to.be.equal('hello');

  });
  it('test verifyOrder', () => {

  });

});
