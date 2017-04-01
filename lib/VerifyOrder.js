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
  OrderStep,
  VerifyResult,
  VerifyResultErrorInfo,
  GenerateErrorFuncArg,
} from 'vx-mock';

const deepEqual = require('deep-equal');
const { StringUtils } = require('vx-var-utils');
const { pad } = StringUtils;
const assert = require('assert');
const Module_Func = 'module_func';
const Module_Var = 'module_var';
const Func = 'func';
const FuncName = '____';

class VerifyOrderImpl {

  mockNames: VerifyOrderMockList;
  steps: Array<OrderStep>;
  moduleVar: ModuleVarStatus;

  constructor () {
    this.steps = [];
    this.mockNames = {};
    this.moduleVar = {};
    return this;
  }


  addModuleCallFunction (mockName: string, funcName: string, callInfo: CallInfo): void {

    this.checkMockNameOnAdd(mockName);

    this.mockNames[ mockName ].push({
      name: funcName,
      type: Module_Func,
    });

    this.steps.push({
      mockName,
      name: funcName,
      callInfo,
      type: Module_Func,
    });
  }


  addModuleVar (mockName: string, attrName: string): void {
    this.checkMockNameOnAdd(mockName);

    this.mockNames[ mockName ].push({
      name: attrName,
      type: Module_Var,
    });

    this.steps.push({
      mockName,
      name: attrName,
      type: Module_Var,

    });
  }

  addCallFunction (mockName: string, callInfo: CallInfo): void {
    this.checkMockNameOnAdd(mockName);

    this.mockNames[ mockName ].push({
      type: Func,
      name: FuncName,
    });

    this.steps.push({
      name: FuncName,
      mockName,
      callInfo,
      type: Func,
    });
  }

  checkMockNameOnAdd (mockName: string) {

    if (this.mockNames[ mockName ] === undefined) {
      this.mockNames[ mockName ] = [];
    }
  }

  getMock () {

    const result = {},
      verifyResult: VerifyResult = { sucess: true, error: {} },
      realyOrder = [];

    let index = 0;

    Object.keys(this.mockNames).forEach(expectMockName => {
      const mockInfoList: Array<VerifyOrderMock> = this.mockNames[ expectMockName ],
        self = this;
      let value = {};
      mockInfoList.forEach(mockInfo => {

        const { name: expectName, type } = mockInfo;
        if (!expectName) {
          return;
        }

        if (type === Module_Func) {
          value[ expectName ] = (...callArgs) => {

            const step = this.steps[ index ];
            realyOrder.push({
              mockName: expectMockName,
              name: expectName,
              type,
              callInfo: {
                args: callArgs,
              },
            });
            if (!step) {
              verifyResult.sucess = false;
              verifyResult.error[ index ] = this.generateError({ stepError: true });
              index++;
              return {
                withContext () {

                },
              };
            }

            const { mockName, name, callInfo } = step;
            let args;
            if (callInfo) {
              ({ args } = callInfo);
            }


            const mockNameIsEql = mockName === expectMockName;
            const nameIsEql = name === expectName;
            const argIsEql = this.isArgsEql(args, callArgs);
            const checkResult = mockNameIsEql && nameIsEql && argIsEql;
            if (checkResult === false) {
              verifyResult.error[ index ] = this.generateError({ mockNameIsEql, nameIsEql, argIsEql });
              verifyResult.sucess = false;
            }

            const withContextObj = {
              withContext: this.withContext(callInfo, verifyResult, index, self),
            };
            index++;
            return withContextObj;
          };
        }

        if (type === Module_Var) {
          if (this.moduleVar[ `${expectMockName}_${expectName}` ] === undefined) {

            this.moduleVar[ `${expectMockName}_${expectName}` ] = true;
            Object.defineProperty(value, expectName, {
              get () {
                const step = self.steps[ index ];
                assert.equal(!!step, true, '超过指定步数');
                assert.equal(step.mockName, expectMockName, '模块不匹配');
                assert.equal(step.name, expectName, '属性不匹配');
                index++;
                return true;
              },
            });
          }
        }

        if (type === Func) {

          value = (...callArgs) => {
            const step = this.steps[ index ];
            assert.equal(!!step, true, '超过指定步数');
            assert.equal(step.mockName, expectMockName, '模块不匹配');
            let args,
              context;

            const { callInfo } = step;
            if (callInfo) {

              ({ args, context } = callInfo);
            }
            assert.deepEqual(callArgs, args, '参数不匹配');
            function withContext (context) {
              return function (ctx: any) {
                assert.deepEqual(ctx, context, 'this绑定不匹配');
              };
            }

            index++;
            return {
              withContext: withContext(context),
            };
          };
        }
        result[ expectMockName ] = value;
      });
      result.__verify__ = () => {
        if (verifyResult.sucess === false) {
          throw Error('验证失败，左边为实际调用顺序，右边为期望调用顺序\n' + this.generateMsg(realyOrder, this.steps, verifyResult.error));
        }
      };
    });

    return result;

  }

  verify (callback: Function): void {
    const mock = this.getMock();
    callback(mock);
    mock.__verify__();
  }

  generateMsg (expectStep: Array<OrderStep>, actulyStep: Array<OrderStep>, error: VerifyResultErrorInfo): string {
    let result: Array<string> = [],
      max: number = 0;

    function parseCallInfo (callInfo: CallInfo): string {
      if (!callInfo) {
        return '';
      }
      const rs: Array<string> = [];
      callInfo.args && callInfo.args.forEach(arg => {
        rs.push(JSON.parse(arg));
      });
      return rs.join(', ');
    }

    function generateOneCall (stepObj: OrderStep): string {
      const { name, mockName, callInfo } = stepObj;
      return `${mockName}${(name !== FuncName) ? '.' + name : ''}(${callInfo ? parseCallInfo(callInfo) : ''});`;
    }

    actulyStep.forEach((step: OrderStep, i: number) => {
      const item = `${i + 1}.  ${generateOneCall(step)}`;
      max = Math.max(item.length, max);
      result.push(item);
    });

    const maxLen: number = Math.max(expectStep.length, actulyStep.length);
    if (maxLen === expectStep.length) {
      for (let i: number = actulyStep.length; i < maxLen; i++) {
        result.push(`${i + 1}.`);
      }
    } else {
      for (let i: number = expectStep.length; i < maxLen; i++) {
        error[ i ] = this.generateError({ stepError: true });
      }
    }
    result = result.map((item: string) => {
      return pad({ str: item, len: max });
    });

    expectStep.forEach((step: OrderStep, i: number) => {
      const item = generateOneCall(step);
      result[ i ] += `   ${item}`;
    });

    for (let i: number = 0; i < maxLen; i++) {
      const msg = error[ i ];
      if (msg && msg.length > 0) {
        result[ i ] += `  <-- ${msg.join(' & ')} is error`;
      }
    }
    console.info(error);
    return result.join('\n');
  }


  isArgsEql (args, callArgs) {


    return deepEqual(args, callArgs);
  }

  withContext (callInfo?: CallInfo, verifyResult: VerifyResult, index: number, self: VerifyOrderImpl) {
    if (callInfo) {
      const { context } = callInfo;
      return function (ctx: any) {
        const ctxIsEql: boolean = ctx === context;
        if (ctxIsEql === false) {
          verifyResult.sucess = false;
          const oldError: Array<string> = verifyResult.error[ index ];
          const ctxError = self.generateError({ ctxIsEql });
          if (oldError && oldError.length > 0) {
            Array.prototype.push.apply(oldError, ctxError);
          } else {
            verifyResult.error[ index ] = self.generateError({ ctxIsEql });
          }
        }

      };
    }
    return () => {};
  }

  generateError ({ ctxIsEql = true, mockNameIsEql = true, nameIsEql = true, argIsEql = true, stepError = false }: GenerateErrorFuncArg): Array<string> {
    const result: Array<string> = [];
    if (mockNameIsEql === false) {
      result.push('module');
    }
    if (nameIsEql === false) {
      result.push('name');
    }
    if (argIsEql === false) {
      result.push('args');
    }
    if (ctxIsEql === false) {
      result.push('context');
    }
    if (stepError === true) {
      result.push('step');
    }
    return result;
  }
}

const exportObj: VerifyOrderFactory = {
  create (): VerifyOrder {
    return new VerifyOrderImpl();
  },
};
module.exports = exportObj;
