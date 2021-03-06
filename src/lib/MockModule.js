/**
 * Created by liguoxin on 2017/2/10.
 * @flow
 */
import type { MockModule, MockModuleFuncReulst, MockVarReulst, VerifyOrderConfig } from 'jverify';

const { MockFunctionInner } = require('./Const');

class MockModuleImpl {
  target: any;
  orderConfig: ?VerifyOrderConfig;
  restore: Array<Function>;
  reset: Array<Function>;

  constructor(module: Object, orderConfig?: VerifyOrderConfig) {
    if (!module) {
      throw new Error('mock的目标对象不能为空!');
    }
    this.target = module;
    this.restore = [];
    this.reset = [];
    this.orderConfig = orderConfig;
    if (orderConfig) {
      const { verifyOrder, mockName } = orderConfig;
      if (verifyOrder && !mockName) {
        throw new Error('开启VerifyOrder，mockName不能为空!');
      }
    }
  }


  /*
   * mock模块中的方法
   * @funcName 目标方法名
   */
  mockFunction(funcName: string): MockModuleFuncReulst {

    const orginal = this.target[ funcName ],
      self = this;
    let callArgs = [],
      callContext = [],
      returned = [],
      mockTarget,
      context,
      orginalContext,
      foreverValue,
      foreverIsOpen = false,
      times = 0;

    this.target[ funcName ] = function(...args: any): any {
      callArgs.push(args);
      const ctx = context ? context : this;

      callContext.push(ctx);
      if (self.orderConfig) {
        const { mockName, verifyOrder } = self.orderConfig;
        if (funcName === MockFunctionInner) {
          verifyOrder.addCallFunction(mockName, { context: ctx, args });
        } else {
          verifyOrder.addModuleCallFunction(mockName, funcName, { context: ctx, args });
        }
      }
      times++;
      if (foreverIsOpen) {
        return foreverValue;
      }
      if (returned.length > 0) {
        return returned.shift();
      }
      if (mockTarget) {
        return mockTarget.apply(context, args);
      }
      return orginal.apply(orginalContext ? orginalContext : this, args);

    };
    let isReset = false;

    function check() {
      if (isReset) {
        throw new Error('mockFunction已被reset，请重新调用mockFunction方法!');
      }
    }

    function reset() {
      check();
      isReset = true;
      self.target[ funcName ] = orginal;
    }

    const mock = (target: Function, ctx?: Object) => {
      check();
      mockTarget = target;
      context = ctx;
    };
    this.reset.push(reset);
    const mockObj = {
      reset,
      mock,
      queryCallArgs(): Array<any> {
        check();
        return callArgs;
      },
      getCallArgs(index: number): any {
        check();
        if (index >= callArgs.length) {
          return undefined;
        }
        return callArgs[ index ];
      },
      returned(arg: any) {
        check();
        returned.push(arg);
      },
      delayReturned(arg: any, timeout: number) {
        check();
        returned.push(new Promise((resolve: Function) => {
          setTimeout(() => {
            resolve(arg);
          }, timeout);
        }));
      },
      forever(arg: any) {
        check();
        foreverValue = arg;
        foreverIsOpen = true;
      },
      queryCallContext(): Array<Object> {
        check();
        return callContext;
      },
      getCallContext(index: number): any {
        check();
        if (index >= callArgs.length) {
          return undefined;
        }
        return callContext[ index ];
      },
      restore() {
        check();
        foreverValue = undefined;
        foreverIsOpen = false;
        mockTarget = undefined;
        returned = [];
        context = undefined;
        callContext = [];
        callArgs = [];
        times = 0;
        orginalContext = undefined;
      },
      callTimes(): number {
        check();
        return times;
      },
      mockContext(ctx: Object) {
        check();
        orginalContext = ctx;
      },
      error(err: string | Error) {
        check();
        mock(() => {
          if (typeof err === 'string') {
            throw new Error(err);
          }
          throw err;
        });

      },

    };
    this.restore.push(() => {
      mockObj.restore();
    });
    return mockObj;

  }


  /*
   * mock模块中的变量
   * @varName 目标变量名
   */
  mockVar(varName: string): MockVarReulst {
    const orginal = this.target[ varName ],
      self = this;

    let isMock = false,
      mockTarget,
      returned = [],
      foreverValue,
      foreverIsOpen = false,
      times = 0;
    Object.defineProperty(this.target, varName, {
      get(): any {
        if (self.orderConfig) {
          const { mockName, verifyOrder } = self.orderConfig;
          verifyOrder.addModuleVar(mockName, varName);
        }
        times++;
        if (foreverIsOpen) {
          return foreverValue;
        }
        if (returned.length > 0) {
          return returned.shift();
        }
        if (isMock) {
          return mockTarget();
        }
        return orginal;
      },
    });
    const mock = (func: any) => {
      isMock = true;
      mockTarget = func;
    };
    const mockObj = {
      mock,
      forever(arg: any) {
        foreverIsOpen = true;
        foreverValue = arg;
      },
      returned(arg: any) {
        returned.push(arg);
      },
      delayReturned(arg: any, timeout: number) {
        returned.push(new Promise((resolve: Function) => {
          setTimeout(() => {
            resolve(arg);
          }, timeout);
        }));
      },
      restore() {
        isMock = false;
        times = 0;
        foreverValue = undefined;
        foreverIsOpen = false;
        returned = [];
      },
      callTimes(): number {
        return times;
      },
      error(err: string | Error) {
        mock(() => {
          if (typeof err === 'string') {
            throw new Error(err);
          }
          throw err;
        });
      },
    };
    this.restore.push(() => {
      mockObj.restore();
    });
    return mockObj;
  }

  restoreAll() {

    this.restore.forEach((restore: Function) => {
      restore();
    });
  }

  resetAll() {
    this.reset = this.reset.filter((restore: Function): boolean => {
      restore();
      return false;
    });
  }
}

module.exports = {
  create(module: any, orderConfig?: VerifyOrderConfig): MockModule {
    return new MockModuleImpl(module, orderConfig);
  },
};
