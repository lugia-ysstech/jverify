/**
 * Created by liguoxin on 2017/3/1.
 * @flow
 */
const chai = require('chai');
const { create } = require('../dist/VerifyOrderConfig');
const { VerifyOrderConfig, VerifyOrder } = require('../dist');
const { expect } = chai;

describe('VerifyOrderConfig', function () {
  beforeEach(() => {
    this.order = VerifyOrder.create();
  });
  it('test index', () => {
    expect(VerifyOrderConfig.create).to.be.equal(create);
  });

  it('test create', () => {
    const mockName = '1';
    expect(create(mockName, this.order)).to.be.eql({
      mockName,
      verifyOrder: this.order,
    });
  });

});
