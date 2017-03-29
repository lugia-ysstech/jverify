/**
 * Created by liguoxin on 2017/2/10.
 * @flow
 */
import type { MockModule, MockFuncReulst, MockVarReulst } from 'vx-mock';

class MockModuleImpl {
  target: any;

  constructor (module: any) {
    if (!module) {
      throw new Error('module的目标路径不能空');
    }
    this.target = module;
  }

  /*
   * mock模块中的方法
   * @funcName 目标方法名
   */
  mockFunction (funcName: string): MockFuncReulst {

    const orginal = this.target[ funcName ];
    let mockTarget,
      times = 0;
    this.target[ funcName ] = function (...args) {
      times++;
      if (mockTarget) {
        return mockTarget.apply(this, args);
      }
      return orginal.apply(this, args);

    };

    return {
      mock (target: Function) {
        mockTarget = target;
      },
      restore () {
        mockTarget = undefined;
      },
      callTimes (): number {
        return times;
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
      times = 0;
    Object.defineProperty(this.target, varName, {
      get () {
        times++;
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
      restore () {
        isMock = false;
      },
      callTimes (): number {
        return times;
      },
    };
  }
}

module.exports = {
  create (module: any): MockModule {
    return new MockModuleImpl(module);
  },
};
