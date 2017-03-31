/**
 * Created by liguoxin on 2017/3/1.
 */
const chai = require('chai');
const { create } = require('../dist/MockModule');
chai.should();
const { expect } = chai;
const query = require('./Query');


describe('RPCClient', function () {

  it('create param is Error', () => {
    expect(() => {
      create();
    }).throw(Error, 'module的目标路径不能空');
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
    mockFunc.mock(() => {
      return 'kxy';
    });
    query.getName().should.to.be.equal('kxy');

    mockFunc.restore();
    query.getName().should.to.be.equal('Lily');
    mockFunc.callTimes(2).should.to.be.equal(3);


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
    mockVar.mock(18);
    mockVar.returned(17);
    mockVar.returned(16);
    query.getAge().should.to.be.equal(17);
    query.getAge().should.to.be.equal(16);
    query.getAge().should.to.be.equal(18);
    mockVar.restore();
    query.getAge().should.to.be.equal(15);
    mockVar.callTimes().should.to.be.equal(5);

  });

  it('test mock func has param', () => {
    const userMock = create(require('./User'));
    const mockAdd = userMock.mockFunction('add');
    query.add(1, 2).should.to.be.equal(3);
    mockAdd.mock((a, b) => {
      return a - b;
    });
    query.add(2, 3).should.to.be.equal(-1);
    mockAdd.callTimes(2).should.to.be.equal(2);
    mockAdd.queryCallArgs().should.to.be.eql([ [ 1, 2 ], [ 2, 3 ] ]);
    mockAdd.queryCallArgs()[0].should.to.be.equal(mockAdd.getCallArgs(0));
    mockAdd.queryCallArgs()[1].should.to.be.equal(mockAdd.getCallArgs(1));
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

});
