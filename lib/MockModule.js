/**
 * Created by liguoxin on 2017/2/10.
 * @flow
 */
import type { MockModule, MockModuleFuncReulst, MockVarReulst, VerifyOrderConfig } from 'vx-mock';

const { MockFunctionInner } = require('./Const');

class MockModuleImpl {
  target: any;
  orderConfig: ?VerifyOrderConfig;
  restore: Array<Function>;

  constructor (module: Object, orderConfig?: VerifyOrderConfig) {
    if (!module) {
      throw new Error('mock的目标对象不能为空!');
    }
    this.target = module;
    this.restore = [];
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
  mockFunction (funcName: string): MockModuleFuncReulst {

    const orginal = this.target[ funcName ],
      self = this;
    let callArgs = [],
      callContext = [],
      returned = [],
      mockTarget,
      context,
      orginalContext,
      times = 0;

    this.target[ funcName ] = function (...args) {
debugger;
      callArgs.push(args);
      const existInReturned = returned.length > 0;
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
      if (existInReturned) {
        return returned.shift();
      }
      if (mockTarget) {
        return mockTarget.apply(context, args);
      }
      return orginal.apply(orginalContext ? orginalContext : this, args);

    };

    const mockObj = {
      mock (target: Function, ctx?: Object) {
        mockTarget = target;
        context = ctx;
      },
      queryCallArgs (): Array<any> {
        return callArgs;
      },
      getCallArgs (index: number): any {
        if (index >= callArgs.length) {
          return undefined;
        }
        return callArgs[ index ];
      },
      returned (arg: any): void {
        returned.push(arg);
      },
      queryCallContext (): Array<Object> {
        return callContext;
      },
      getCallContext (index: number): any {
        if (index >= callArgs.length) {
          return undefined;
        }
        return callContext[ index ];
      },
      restore () {
        mockTarget = undefined;
        returned = [];
        context = undefined;
        callContext = [];
        callArgs = [];
        times = 0;
        orginalContext = undefined;
      },
      callTimes (): number {
        return times;
      },
      mockContext (ctx: Object): void {
        orginalContext = ctx;
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
  mockVar (varName: string): MockVarReulst {
    const orginal = this.target[ varName ],
      self = this;

    let isMock = false,
      mockTarget,
      returned = [],
      times = 0;
    Object.defineProperty(this.target, varName, {
      get () {
        if (self.orderConfig) {
          const { mockName, verifyOrder } = self.orderConfig;
          verifyOrder.addModuleVar(mockName, varName);
        }
        times++;
        if (returned.length > 0) {
          return returned.shift();
        }
        if (isMock) {
          return mockTarget;
        }
        return orginal;
      },
    });
    const mockObj = {
      mock (arg) {
        isMock = true;
        mockTarget = arg;
      },
      returned (arg: any): void {
        returned.push(arg);
      },
      restore () {
        isMock = false;
        times = 0;
        returned = [];
      },
      callTimes (): number {
        return times;
      },
    };
    this.restore.push(() => {
      mockObj.restore();
    });
    return mockObj;
  }

  restoreAll (): void {

    this.restore.forEach(restore => {
      restore();
    });
  }
}

module.exports = {
  create (module: any, orderConfig?: VerifyOrderConfig): MockModule {
    return new MockModuleImpl(module, orderConfig);
  },
};
