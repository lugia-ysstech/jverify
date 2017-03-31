/**
 * Created by liguoxin on 2017/2/10.
 * @flow
 */
import type { ModuleMockFactory, MockFunctionFactory } from 'vx-mock';

const mockModuleFacotry: ModuleMockFactory = require('./MockModule');
const functionModuleFacotry: MockFunctionFactory = require('./MockFunction');
module.exports = {
  mockObject: mockModuleFacotry,
  mockFunction: functionModuleFacotry,
};
