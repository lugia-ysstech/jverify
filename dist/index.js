/**
 * Created by liguoxin on 2017/2/10.
 * @flow
 */
/*:: import type { ModuleMockFactory } from 'vx-mock';*/


const mockModuleFacotry /*: ModuleMockFactory*/ = require('./MockModule');
module.exports = {
  mockRequire: mockModuleFacotry
};