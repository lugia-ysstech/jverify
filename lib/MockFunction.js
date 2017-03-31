/**
 * Created by liguoxin on 2017/2/10.
 * @flow
 */
import type { MockFunctionResult, VerifyOrder } from 'vx-mock';
const MockModule = require('./MockModule');

class MockFunctionImpl {
  target: Function;
  verifyOrder: ?VerifyOrder;
  mockName: ?string;

  constructor (mockName: ?string, verifyOrder?: VerifyOrder) {
    if (verifyOrder && !mockName) {
      throw new Error('开启VerifyOrder，mockName不能为空!');
    }
    this.target = () => {};
    this.mockName = mockName;
    this.verifyOrder = verifyOrder;
  }

  createMockResult (): MockFunctionResult {
    const funcName = '__mockFunctionInner';
    const target = {
      [funcName]: this.target,
    };
    const mockModule = MockModule.create(target, this.mockName, this.verifyOrder ? this.verifyOrder : undefined);
    const mockFunctionResult = mockModule.mockFunction(funcName);

    return {
      getFunction () {
        return target[ funcName ];
      },
      mock (func: Function, ctx?: Object): void {
        mockFunctionResult.mock(func, ctx);
      },

      queryCallArgs (): Array<any> {
        return mockFunctionResult.queryCallArgs();
      },
      getCallArgs (index: number): Array<any> {
        return mockFunctionResult.getCallArgs(index);

      },
      queryCallContext (): Array<Object> {
        return mockFunctionResult.queryCallContext();

      },
      getCallContext (index: number): any {
        return mockFunctionResult.getCallContext(index);

      },
      restore (): void {
        mockFunctionResult.restore();
      },
      callTimes (): number {
        return mockFunctionResult.callTimes();
      },

      returned (arg: any): void {
        mockFunctionResult.returned(arg);
      },
    };

  }
}

module.exports = {
  create (mockName: ?string, verifyOrder?: VerifyOrder): MockFunctionResult {
    return new MockFunctionImpl(mockName, verifyOrder).createMockResult();
  },
};
