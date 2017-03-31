/**
 * Created by liguoxin on 2017/2/10.
 * @flow
 */
import type {
  VerifyOrder,
  VerifyOrderFactory,
  CallInfo,
  VerifyOrderMockList,
  VerifyOrderMock,
  ModuleVarStatus,
} from 'vx-mock';
const assert = require('assert');
const Module_Func = 'module_func';
const Module_Var = 'module_var';
const Func = 'func';

class VerifyOrderImpl {

  mockNames: VerifyOrderMockList;
  steps: Array<any>;
  moduleVar: ModuleVarStatus;

  constructor () {
    this.steps = [];
    this.mockNames = {};
    this.moduleVar = {};
  }


  addModuleCallFunction (mockName: string, funcName: string, callInfo: CallInfo): void {

    this.checkMockName(mockName);

    this.mockNames[ mockName ].push({
      name: funcName,
      type: Module_Func,
    });

    this.steps.push({
      mockName,
      funcName,
      callInfo,
    });
  }


  addModuleVar (mockName: string, attrName: string): void {
    this.checkMockName(mockName);

    this.mockNames[ mockName ].push({
      name: attrName,
      type: Module_Var,
    });

    this.steps.push({
      mockName,
      attrName,
    });
  }

  addCallFunction (mockName: string, callInfo: CallInfo): void {
    this.checkMockName(mockName);

    this.mockNames[ mockName ].push({
      type: Func,
      name: '__',
    });

    this.steps.push({
      mockName,
      callInfo,
    });
  }

  checkMockName (mockName: string) {
    if (this.mockNames[ mockName ] === undefined) {
      this.mockNames[ mockName ] = [];
    }
  }

  getMock (): any {

    const result = {};
    let index = 0;
    Object.keys(this.mockNames).forEach(mockName => {
      const mockInfoList: Array<VerifyOrderMock> = this.mockNames[ mockName ],
        self = this;

      let value = {};
      mockInfoList.forEach(mockInfo => {
        const { name, type } = mockInfo;
        if (!name) {
          return;
        }
        if (type === Module_Func) {
          const funcName = name;
          value[ funcName ] = (...callArgs) => {
            const step = this.steps[ index ];
            assert.equal(!!step, true, '超过指定步数');
            assert.equal(step.mockName, mockName, '模块不匹配');
            assert.equal(step.funcName, funcName, '方法不匹配');
            const { callInfo } = step;
            const { args, context } = callInfo;
            assert.deepEqual(args, callArgs, '参数不匹配');
            index++;
            return {
              withContext (ctx: any) {
                assert.deepEqual(context, ctx, 'this绑定不匹配');
              },
            };
          };
        }
        if (type === Module_Var) {
          if (this.moduleVar[ `${mockName}_${name}` ] === undefined) {

            this.moduleVar[ `${mockName}_${name}` ] = true;
            Object.defineProperty(value, name, {
              get () {
                const step = self.steps[ index ];
                assert.equal(!!step, true, '超过指定步数');
                assert.equal(step.mockName, mockName, '模块不匹配');
                assert.equal(step.attrName, name, '属性不匹配');
                index++;
                return true;
              },
            });
          }
        }
        if (type === Func) {

          value = function (...callArgs) {
            const step = self.steps[ index ];
            assert.equal(!!step, true, '超过指定步数');
            assert.equal(step.mockName, mockName, '模块不匹配');
            const { callInfo } = step;
            const { args, context } = callInfo;
            assert.deepEqual(callArgs, args, '参数不匹配');
            function withContext (context) {
              return function (ctx: any) {
                console.info('aa');
                assert.deepEqual(ctx, context, 'this绑定不匹配');
              };
            }

            index++;
            return {
              withContext: withContext(context),
            };
          };
        }
        result[ mockName ] = value;
      });

    });

    return result;

  }
}

const exportObj: VerifyOrderFactory = {
  create (): VerifyOrder {
    return new VerifyOrderImpl();
  },
};
module.exports = exportObj;
