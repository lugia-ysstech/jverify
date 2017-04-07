/**
 * Created by liguoxin on 2017/2/10.
 * @flow
 */
/*:: import type {
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
  VarNameObserve,
} from 'vx-mock';*/


const deepEqual = require('deep-equal');
const { StringUtils } = require('vx-var-utils');
const { pad } = StringUtils;
const Module_Func = 'module_func';
const Module_Var = 'module_var';
const Func = 'func';
const FuncName = '____';

class VerifyOrderImpl {
  /*:: mockNames: VerifyOrderMockList;*/
  /*:: steps: Array<OrderStep>;*/
  /*:: moduleVar: ModuleVarStatus;*/
  /*:: varNameObserve: VarNameObserve;*/


  constructor() {
    this.steps = [];
    this.mockNames = {};
    this.moduleVar = {};
    this.varNameObserve = {};
    return this;
  }

  addModuleCallFunction(mockName /*: string*/, funcName /*: string*/, callInfo /*: CallInfo*/) /*: void*/ {

    this.checkMockNameOnAdd(mockName);

    this.mockNames[mockName].push({
      name: funcName,
      type: Module_Func
    });

    this.steps.push({
      mockName,
      name: funcName,
      callInfo,
      type: Module_Func
    });
  }

  addModuleVar(mockName /*: string*/, attrName /*: string*/) /*: void*/ {
    this.checkMockNameOnAdd(mockName);

    this.mockNames[mockName].push({
      name: attrName,
      type: Module_Var
    });

    this.steps.push({
      mockName,
      name: attrName,
      type: Module_Var

    });
  }

  addCallFunction(mockName /*: string*/, callInfo /*: CallInfo*/) /*: void*/ {
    this.checkMockNameOnAdd(mockName);

    this.mockNames[mockName].push({
      type: Func,
      name: FuncName
    });

    this.steps.push({
      name: FuncName,
      mockName,
      callInfo,
      type: Func
    });
  }

  checkMockNameOnAdd(mockName /*: string*/) {

    if (this.mockNames[mockName] === undefined) {
      this.mockNames[mockName] = [];
    }
  }

  getMock() {
    this.moduleVar = {};

    const result = {},
          verifyResult /*: VerifyResult*/ = { sucess: true, error: {} },
          realyOrder /*: Array<OrderStep>*/ = [];

    let index = 0;

    Object.keys(this.mockNames).forEach(expectMockName => {
      const mockInfoList /*: Array<VerifyOrderMock>*/ = this.mockNames[expectMockName],
            self = this;
      let value = {};

      mockInfoList.forEach(mockInfo => {

        const { name: expectName, type } = mockInfo;
        if (!expectName) {
          return;
        }

        if (type === Module_Func) {
          value[expectName] = (...callArgs) => {

            const step = this.steps[index];
            realyOrder.push({
              mockName: expectMockName,
              name: expectName,
              type,
              callInfo: {
                args: callArgs
              }
            });
            if (!step) {
              verifyResult.sucess = false;
              verifyResult.error[index] = this.generateError({ stepError: true });
              index++;
              return {
                withContext() {}
              };
            }

            const { mockName, name, callInfo } = step;
            let args = [];
            if (callInfo) {
              ({ args } = callInfo);
            }

            const mockNameIsEql = mockName === expectMockName;
            const nameIsEql = name === expectName;
            const argIsEql = this.isArgsEql(args, callArgs);
            const checkResult = mockNameIsEql && nameIsEql && argIsEql;
            if (checkResult === false) {
              verifyResult.error[index] = this.generateError({ mockNameIsEql, nameIsEql, argIsEql });
              verifyResult.sucess = false;
            }

            const withContextObj = {
              withContext: this.withContext(callInfo, verifyResult, index, self)
            };
            index++;
            return withContextObj;
          };
        }

        if (type === Module_Var) {

          if (this.moduleVar[`${expectMockName}_${expectName}`] === undefined) {

            this.moduleVar[`${expectMockName}_${expectName}`] = true;

            Object.defineProperty(value, expectName, {
              get() {

                const step = self.steps[index];
                realyOrder.push({
                  mockName: expectMockName,
                  name: expectName,
                  type
                });
                if (!step) {
                  verifyResult.sucess = false;
                  verifyResult.error[index] = self.generateError({ stepError: true });
                  index++;
                  return true;
                }
                const { mockName, name } = step;

                const mockNameIsEql = mockName === expectMockName;
                const nameIsEql = name === expectName;
                const checkResult = mockNameIsEql && nameIsEql;
                if (checkResult === false) {
                  verifyResult.error[index] = self.generateError({ mockNameIsEql, nameIsEql });
                  verifyResult.sucess = false;
                }
                index++;
                return true;
              }
            });
          }
        }

        if (type === Func) {

          value = (...callArgs) => {

            const step = this.steps[index];
            realyOrder.push({
              mockName: expectMockName,
              name: FuncName,
              type,
              callInfo: {
                args: callArgs
              }
            });
            if (!step) {
              verifyResult.sucess = false;
              verifyResult.error[index] = this.generateError({ stepError: true });
              index++;
              return {
                withContext() {}
              };
            }

            const { mockName, callInfo } = step;
            let args = [];
            if (callInfo) {
              ({ args } = callInfo);
            }

            const mockNameIsEql = mockName === expectMockName;
            const argIsEql = this.isArgsEql(args, callArgs);
            const checkResult = mockNameIsEql && argIsEql;
            if (checkResult === false) {
              verifyResult.error[index] = this.generateError({ mockNameIsEql, argIsEql });
              verifyResult.sucess = false;
            }

            const withContextObj = {
              withContext: this.withContext(callInfo, verifyResult, index, self)
            };
            index++;
            return withContextObj;
          };
        }
        if (type === Func) {
          result[expectMockName] = value;
        } else {
          result[expectMockName] = new Proxy(value, {
            get(target, props) {
              if (!target.hasOwnProperty(props)) {
                throw new Error(`${expectMockName}.${props} is undefined`);
              }
              return value[props];
            }
          });
        }
      });
      result.__verify__ = err => {
        if (err) {
          verifyResult.error[realyOrder.length] = [err.message];
          throw Error('验证失败，左边为实际调用顺序，右边为期望调用顺序\n' + this.generateMsg(realyOrder, this.steps, verifyResult.error));
        } else {
          if (verifyResult.sucess === false || realyOrder.length !== this.steps.length) {
            throw Error('验证失败，左边为实际调用顺序，右边为期望调用顺序\n' + this.generateMsg(realyOrder, this.steps, verifyResult.error));
          }
        }
      };
    });

    return result;
  }

  verify(callback /*: Function*/) /*: void*/ {
    const mock = this.getMock();
    try {
      callback(mock);
    } catch (err) {
      mock.__verify__(err);
      return;
    }
    mock.__verify__();
  }

  generateMsg(expectStep /*: Array<OrderStep>*/, actulyStep /*: Array<OrderStep>*/, error /*: VerifyResultErrorInfo*/) /*: string*/ {
    let result /*: Array<string>*/ = [],
        max /*: number*/ = 0;

    function parseCallInfo(callInfo /*: CallInfo*/) /*: string*/ {
      if (!callInfo) {
        return '';
      }
      const rs /*: Array<string>*/ = [];
      callInfo.args && callInfo.args.forEach(arg => {
        rs.push(JSON.stringify(arg));
      });
      return rs.join(', ');
    }

    function generateOneCall(stepObj /*: OrderStep*/) /*: string*/ {
      const { name, mockName, callInfo, type } = stepObj;
      switch (type) {
        case Module_Func:
          return `${mockName}.${name}(${callInfo ? parseCallInfo(callInfo) : ''});`;
        case Func:
          return `${mockName}(${callInfo ? parseCallInfo(callInfo) : ''});`;
        case Module_Var:
          return `${mockName}${name !== FuncName ? '.' + name : ''};`;
        default:
          return '';
      }
    }

    actulyStep.forEach((step /*: OrderStep*/, i /*: number*/) => {
      const item = `${i + 1}.  ${generateOneCall(step)}`;
      max = Math.max(item.length, max);
      result.push(item);
    });

    const maxLen /*: number*/ = Math.max(expectStep.length, actulyStep.length);
    if (maxLen === expectStep.length) {
      for (let i /*: number*/ = actulyStep.length; i < maxLen; i++) {
        result.push(`${i + 1}.`);
      }
    } else {
      for (let i /*: number*/ = expectStep.length; i < maxLen; i++) {
        const stepError = this.generateError({ stepError: true });
        if (error[i]) {
          Array.prototype.push.apply(error[i], stepError);
        } else {
          error[i] = stepError;
        }
      }
    }
    result = result.map((item /*: string*/) => {
      return pad({ str: item, len: max });
    });

    expectStep.forEach((step /*: OrderStep*/, i /*: number*/) => {
      const item = generateOneCall(step);
      result[i] += `   ${item}`;
    });
    let i /*: number*/ = 0;
    for (; i < maxLen; i++) {
      const msg = error[i];
      if (msg && msg.length > 0) {
        result[i] += `  <-- ${msg.join(' & ')} is error`;
      }
    }
    if (error[i]) {
      result[i] = `${i + 1}.  <-- ${error[i].join('')} & ${this.generateError({ stepError: true }).join('')} is error`;
    }
    return result.join('\n');
  }

  isArgsEql(args, callArgs) {

    return deepEqual(args, callArgs);
  }

  withContext(callInfo /*:: ?: CallInfo*/, verifyResult /*: VerifyResult*/, index /*: number*/, self /*: VerifyOrderImpl*/) {
    if (callInfo) {
      const { context } = callInfo;
      return function (ctx /*: any*/) {
        const ctxIsEql /*: boolean*/ = ctx === context;
        if (ctxIsEql === false) {
          verifyResult.sucess = false;
          const oldError /*: Array<string>*/ = verifyResult.error[index];
          const ctxError = self.generateError({ ctxIsEql });
          if (oldError && oldError.length > 0) {
            Array.prototype.push.apply(oldError, ctxError);
          } else {
            verifyResult.error[index] = self.generateError({ ctxIsEql });
          }
        }
      };
    }
    return () => {};
  }

  generateError({ ctxIsEql = true, mockNameIsEql = true, nameIsEql = true, argIsEql = true, stepError = false } /*: GenerateErrorFuncArg*/) /*: Array<string>*/ {
    const result /*: Array<string>*/ = [];
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

const exportObj /*: VerifyOrderFactory*/ = {
  create() /*: VerifyOrder*/ {
    return new VerifyOrderImpl();
  }
};
module.exports = exportObj;