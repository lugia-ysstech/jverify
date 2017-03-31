/**
 * Created by liguoxin on 2017/2/10.
 * @flow
 */
import type { MockModule, MockModuleFuncReulst, MockVarReulst, VerifyOrder } from 'vx-mock';

class MockModuleImpl {
  target: any;
  verifyOrder: ?VerifyOrder;
  mockName: ?string;

  constructor (module: Object, mockName: ?string, verifyOrder?: VerifyOrder) {
    if (!module) {
      throw new Error('mock的目标对象不能为空!');
    }
    if (verifyOrder && !mockName) {
      throw new Error('开启VerifyOrder，mockName不能为空!');
    }
    this.target = module;
    this.mockName = mockName;
    this.verifyOrder = verifyOrder;
  }


  /*
   * mock模块中的方法
   * @funcName 目标方法名
   */
  mockFunction (funcName: string): MockModuleFuncReulst {

    const orginal = this.target[ funcName ];
    let callArgs = [],
      callContext = [],
      returned = [],
      mockTarget,
      context,
      orginalContext,
      times = 0;
    this.target[ funcName ] = function (...args) {

      callArgs.push(args);
      const existInReturned = returned.length > 0;

      if (context) {
        callContext.push(context);
      } else {
        callContext.push(this);
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

    return {
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
      mockContext(ctx: Object): void{
        orginalContext = ctx;
      },
    };

  }


  /*
   * mock模块中的变量
   * @varName 目标变量名
   */
  mockVar (varName: string): MockVarReulst {
    const orginal = this.target[ varName ];

    let isMock = false,
      mockTarget,
      returned = [],
      times = 0;
    Object.defineProperty(this.target, varName, {
      get () {
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
    return {
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
  }
}

module.exports = {
  create (module: any, mockName: ?string, verifyOrder?: VerifyOrder): MockModule {
    return new MockModuleImpl(module, mockName, verifyOrder);
  },
};
