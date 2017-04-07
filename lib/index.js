/**
 * Created by liguoxin on 2017/2/10.
 * @flow
 */
import type { ModuleMockFactory, MockFunctionFactory,VerifyOrder } from 'vx-mock';

const mockModuleFacotry: ModuleMockFactory = require('./MockModule');
const functionModuleFacotry: MockFunctionFactory = require('./MockFunction');
const verifyOrder: VerifyOrder = require('./VerifyOrder');
module.exports = {
  mockObject: mockModuleFacotry,
  mockFunction: functionModuleFacotry,
  VerifyOrder: verifyOrder,
};
