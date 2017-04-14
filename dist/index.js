/**
 * Created by liguoxin on 2017/2/10.
 * @flow
 */
/*:: import type { MockFunctionFactory, ModuleMockFactory, VerifyOrderFactory, VerifyOrderConfigFactory } from 'vx-mock';*/


const mockModuleFacotry /*: ModuleMockFactory*/ = require('./MockModule');
const functionModuleFacotry /*: MockFunctionFactory*/ = require('./MockFunction');
const verifyOrderConfigFactory /*: VerifyOrderConfigFactory*/ = require('./VerifyOrderConfig');

const verifyOrder /*: VerifyOrderFactory*/ = require('./VerifyOrder');

module.exports = {
  mockObject: mockModuleFacotry,
  mockFunction: functionModuleFacotry,
  VerifyOrder: verifyOrder,
  VerifyOrderConfig: verifyOrderConfigFactory
};