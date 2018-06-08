/**
 * Created by liguoxin on 2017/2/10.
 * @flow
 */
import type { MockFunctionResult, VerifyOrderConfig } from 'jverify';
const MockModule = require('./MockModule');
const { MockFunctionInner } = require('./Const');

class MockFunctionImpl {
  target: Function;
  orderConfig: ?VerifyOrderConfig;

  constructor(orderConfig?: VerifyOrderConfig) {
    this.target = () => {};
    if (orderConfig) {
      const { verifyOrder, mockName } = orderConfig;
      if (verifyOrder && !mockName) {
        throw new Error('开启VerifyOrder，mockName不能为空!');
      }
      this.orderConfig = orderConfig;
    }
  }

  createMockResult(): MockFunctionResult {
    const funcName = MockFunctionInner;
    const target = {
      [funcName]: this.target,
    };
    const mockModule = MockModule.create(target, this.orderConfig ? this.orderConfig : undefined);
    const mockFunctionResult = mockModule.mockFunction(funcName);

    return {
      getFunction(): any {
        return target[ funcName ];
      },
      mock(func: Function, ctx?: Object) {
        mockFunctionResult.mock(func, ctx);
      },

      queryCallArgs(): Array<any> {
        return mockFunctionResult.queryCallArgs();
      },
      getCallArgs(index: number): Array<any> {
        return mockFunctionResult.getCallArgs(index);

      },
      queryCallContext(): Array<Object> {
        return mockFunctionResult.queryCallContext();

      },
      getCallContext(index: number): any {
        return mockFunctionResult.getCallContext(index);

      },
      delayReturned(arg: any, timeout: number) {
        mockFunctionResult.delayReturned(arg, timeout);
      },
      restore() {
        mockFunctionResult.restore();
      },
      callTimes(): number {
        return mockFunctionResult.callTimes();
      },

      returned(arg: any) {
        mockFunctionResult.returned(arg);
      },
      forever(arg: any) {
        mockFunctionResult.forever(arg);
      },
      error(err: string | Error) {
        mockFunctionResult.error(err);
      },
    };

  }
}

module.exports = {
  create(orderConfig?: VerifyOrderConfig): MockFunctionResult {
    return new MockFunctionImpl(orderConfig).createMockResult();
  },
};
