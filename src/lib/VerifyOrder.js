/**
 * Created by liguoxin on 2017/2/10.
 * @flow
 */
import type {
  CallInfo,
  GenerateErrorFuncArg,
  ModuleVarStatus,
  OrderStep,
  VarNameObserve,
  VerifyOrder,
  VerifyOrderMock,
  VerifyOrderMockList,
  VerifyResult,
  VerifyResultErrorInfo,
} from 'jverify';

const clone = require('clone');
const cycle = require('./cycle');
const deepEqual = require('deep-equal');
const { StringUtils, ObjectUtils } = require('@lugia/type-utils');
const { pad } = StringUtils;
const { isFunction,
  isError,
  isObject,
  isArray,
  isString,
  isDate,
  isNumber,
  isBoolean } = ObjectUtils;
const Module_Func = 'module_func';
const Module_Var = 'module_var';
const Func = 'func';
const FuncName = '____';

const FunctionSymbol = Symbol('Function');
const StringSymbol = Symbol('String');
const NumberSymbol = Symbol('Number');
const BooleanSymbol = Symbol('Boolean');
const DateSymbol = Symbol('Date');
const AnySymbol = Symbol('Any');
const Errorymbol = Symbol('Error');
const ArraySymbol = Symbol('Array');
const ObjectSymbol = Symbol('Object');
const RegexpSymbol = Symbol('Regexp');
const AsyncFunctionSymbol = Symbol('AsyncFunction');

class VerifyOrderImpl {

  mockNames: VerifyOrderMockList;
  steps: Array<OrderStep>;
  moduleVar: ModuleVarStatus;
  varNameObserve: VarNameObserve;

  constructor (): VerifyOrderImpl {
    this.steps = [];
    this.mockNames = {};
    this.moduleVar = {};
    this.varNameObserve = {};
    return this;
  }


  addModuleCallFunction (mockName: string, funcName: string, callInfo: ?CallInfo) {

    this.checkMockNameOnAdd(mockName);

    this.mockNames[ mockName ].push({
      name: funcName,
      type: Module_Func,
    });


    this.steps.push({
      mockName,
      name: funcName,
      callInfo: this.checkCallInfo(callInfo),
      type: Module_Func,
    });
  }

  checkCallInfo (callInfo: ?CallInfo): CallInfo {
    const result = callInfo ? callInfo : { args: [] };
    if (!result.args) {
      result.args = [];
    }
    return result;
  }


  addModuleVar (mockName: string, attrName: string) {
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

  addCallFunction (mockName: string, callInfo: ?CallInfo) {
    this.checkMockNameOnAdd(mockName);

    this.mockNames[ mockName ].push({
      type: Func,
      name: FuncName,
    });

    this.steps.push({
      name: FuncName,
      mockName,
      callInfo: this.checkCallInfo(callInfo),
      type: Func,
    });
  }

  checkMockNameOnAdd (mockName: string) {

    if (this.mockNames[ mockName ] === undefined) {
      this.mockNames[ mockName ] = [];
    }
  }

  getMock (): any {
    this.moduleVar = {};

    const result = {},
      verifyResult: VerifyResult = { sucess: true, error: {} },
      realyOrder: Array<OrderStep> = [];

    let index = 0;

    Object.keys(this.mockNames).forEach((expectMockName: string) => {
      const mockInfoList: Array<VerifyOrderMock> = this.mockNames[ expectMockName ],
        self = this;
      let value = {};

      mockInfoList.forEach((mockInfo: Object) => {

        const { name: expectName, type } = mockInfo;
        if (!expectName) {
          return;
        }

        if (type === Module_Func) {
          value[ expectName ] = (...callArgs: any): any => {
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
            let args = [];
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
              get (): boolean {

                const step = self.steps[ index ];
                realyOrder.push({
                  mockName: expectMockName,
                  name: expectName,
                  type,
                });
                if (!step) {
                  verifyResult.sucess = false;
                  verifyResult.error[ index ] = self.generateError({ stepError: true });
                  index++;
                  return true;
                }
                const { mockName, name } = step;

                const mockNameIsEql = mockName === expectMockName;
                const nameIsEql = name === expectName;
                const checkResult = mockNameIsEql && nameIsEql;
                if (checkResult === false) {
                  verifyResult.error[ index ] = self.generateError({ mockNameIsEql, nameIsEql });
                  verifyResult.sucess = false;
                }
                index++;
                return true;
              },
            });
          }
        }

        if (type === Func) {

          value = (...callArgs: any): any => {

            const step = this.steps[ index ];
            realyOrder.push({
              mockName: expectMockName,
              name: FuncName,
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

            const { mockName, callInfo } = step;
            let args = [];
            if (callInfo) {
              ({ args } = callInfo);
            }


            const mockNameIsEql = mockName === expectMockName;
            const argIsEql = this.isArgsEql(args, callArgs);
            const checkResult = mockNameIsEql && argIsEql;
            if (checkResult === false) {
              verifyResult.error[ index ] = this.generateError({ mockNameIsEql, argIsEql });
              verifyResult.sucess = false;
            }

            const withContextObj = {
              withContext: this.withContext(callInfo, verifyResult, index, self),
            };
            index++;
            return withContextObj;
          };
        }
        if (type === Func) {
          result[ expectMockName ] = value;
        } else {
          result[ expectMockName ] = new Proxy(value, {
            get (target: Object, props: string): any {
              if (!target.hasOwnProperty(props)) {
                throw new Error(`${expectMockName}.${props} is undefined`);
              }
              return value[ props ];
            },
          });
        }
      });
      result.__verify__ = (err: Object) => {
        if (err) {
          verifyResult.error[ realyOrder.length ] = [ err.message ];
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

  verify (callback: Function) {
    const mock = this.getMock();
    try {
      callback(mock);
    } catch (err) {
      if (mock.__verify__) {
        mock.__verify__(err);
      } else {
        throw err;
      }
      return;
    }
    mock.__verify__ && mock.__verify__();
  }

  generateMsg (expectStep: Array<OrderStep>, actulyStep: Array<OrderStep>, error: VerifyResultErrorInfo): string {
    let result: Array<string> = [],
      max: number = 0;

    function setProp (obj: any): any {

      if (!isObject(obj)) {
        return obj;
      }
      let result = {};
      if (isArray(obj)) {
        result = [];
        obj.forEach((value: any, i: number) => {
          result[ i ] = value;
          if (value === undefined) {
            result[ i ] = 'value is undefined';
          } else if (isFunction(value)) {
            result[ i ] = value.toString();
          } else if (isError(value)) {
            result[ i ] = { message: value.message };
          } else if (isObject(value) && !cycle.isCycle(value)) {

            result[ i ] = setProp(value);
          }
        });
      } else {
        for (const p in obj) {
          const value = obj[ p ];
          result[ p ] = value;
          if (value === undefined) {
            result[ p ] = 'value is undefined';
          } else if (isFunction(value)) {
            result[ p ] = value.toString();
          } else if (isError(value)) {
            result[ p ] = { message: value.message };
          } else if (isObject(value) && !cycle.isCycle(value)) {
            result[ p ] = setProp(value);
          }
        }
      }
      return result;
    }


    function parseCallInfo (callInfo: CallInfo): string {
      if (!callInfo) {
        return '';
      }
      const rs: Array<string> = [];
      callInfo.args && callInfo.args.forEach((arg: Object) => {
        if (isFunction(arg)) {
          rs.push(arg.toString());
        } else {
          if (isError(arg)) {
            rs.push(`{"message":"${arg.message}"`);
          } else {
            rs.push(JSON.stringify(setProp(cycle.decycle(arg))));
          }
        }
      });
      return rs.join(', ');
    }

    function generateOneCall (stepObj: OrderStep): string {
      const { name, mockName, callInfo, type } = stepObj;
      switch (type) {
        case Module_Func:
          return `${mockName}.${name}(${callInfo ? parseCallInfo(callInfo) : ''});`;
        case Func:
          return `${mockName}(${callInfo ? parseCallInfo(callInfo) : ''});`;
        case Module_Var:
          return `${mockName}${(name !== FuncName) ? '.' + name : ''};`;
        default:
          return '';
      }
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
        const stepError = this.generateError({ stepError: true });
        if (error[ i ]) {
          Array.prototype.push.apply(error[ i ], stepError);
        } else {
          error[ i ] = stepError;
        }
      }
    }
    result = result.map((item: string): string => {
      return pad({ str: item, len: max });
    });

    expectStep.forEach((step: OrderStep, i: number) => {
      const item = generateOneCall(step);
      result[ i ] += `   ${item}`;
    });
    let i: number = 0;
    for (; i < maxLen; i++) {
      const msg = error[ i ];
      if (msg && msg.length > 0) {
        result[ i ] += `  <-- ${msg.join(' & ')} is error`;
      }
    }
    if (error[ i ]) {
      result[ i ] = `${i + 1}.  <-- ${error[ i ].join('')} & ${this.generateError({ stepError: true }).join('')} is error`;
    }
    return result.join('\n');
  }


  isArgsEql (actualArgs?: Array<any> = [], expectCallArgs?: Array<any> = []): boolean {
    if (actualArgs.length !== expectCallArgs.length) {
      return false;
    }
    const { fetch, setValue } = exportObj.parseObject(actualArgs);
    let matchType = function (item, arg) {
      let isEqual = false;
      switch (item) {
        case NumberSymbol:
          isNumber(arg) && (isEqual = true);
          break;
        case StringSymbol:
          isString(arg) && (isEqual = true);
          break;
        case BooleanSymbol:
          isBoolean(arg) && (isEqual = true);
          break;
        case DateSymbol:
          isDate(arg) && (isEqual = true);
          break;
        case AnySymbol:
          isEqual = true;
          break;
        case Errorymbol:
          isError(arg) && (isEqual = true);
          break;
        case FunctionSymbol:
          isFunction && (isEqual = true);
          break;
        case ObjectSymbol:
          isObject(arg) && (isEqual = true);
          break;
        case ArraySymbol:
          isArray(arg) && (isEqual = true);
          break;
        case RegexpSymbol:
          isRegExp(arg) && (isEqual = true);
          break;
        case AsyncFunctionSymbol:
          isAsyncFunction(arg) && (isEqual = true);
          break;
        default:
      }
      return isEqual;
    };
    const { getValue } = exportObj.parseObject(expectCallArgs);

    let match = function (path, actualItem) {
      const pathStr = path.join('.');
      let expectItem;
      try {
        expectItem = getValue(pathStr);
      } catch (e) {

      }

      matchType(expectItem, actualItem) && setValue(pathStr, expectItem);
      return !!expectItem;
    };

    function process (actualItem, path) {
      if (isArray(actualItem)) {
        let bool = false;
        actualItem.forEach((item, index) => {
          if (cycle.isCycle(item)) {
            return;
          }
          const result = process(item, [ ...path, index + '' ]);
          bool = bool || result;
        });
        if (bool === false) {
          return match(path, actualItem);
        }
      } else if (isObject(actualItem)) {
        let bool = false;

        Object.keys(actualItem).forEach(key => {
          let item = actualItem[ key ];
          if (cycle.isCycle(item)) {
            return;
          }

          let result = process(item, [ ...path, key ]);
          bool = bool || result;
        });
        if (bool === false) {
          return match(path, actualItem);
        }
      } else {
        return match(path, actualItem);
      }
    }

    cycle.decycle(actualArgs).forEach((actualItem, index) => {
      process(actualItem, [ index + '' ]);
    });
    return deepEqual(fetch(), expectCallArgs);
  }

  withContext (callInfo ?: CallInfo, verifyResult: VerifyResult, index: number, self: VerifyOrderImpl): Function {
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

const exportObj = {
  create (): VerifyOrder {
    return new VerifyOrderImpl();
  },
  createOrgial (): VerifyOrderImpl {
    return new VerifyOrderImpl();
  },
  parseObject (data: Object) {

    const isArrayBool = isArray(data);
    const isObjectBool = isObject(data);
    let realyData = '数据类型错误';
    if (isArrayBool || isObjectBool) {
      try{
        realyData = clone(data, true);
      }catch (err) {
        console.warn('clone err');
        realyData = data;
      }
      function check (pathStr: any) {
        if (!isString(pathStr)) {
          throw  new Error('path参数错误');
        }
      }

      return {
        getValue (pathStr: string) {
          check(pathStr);
          const pathArray = pathStr.split('.');
          let result = data;
          pathArray.forEach((path: string) => {
            result = result[ path ]
          });
          return result;
        },

        setValue (pathStr: string, val: any) {
          check(pathStr);
          const pathArray = pathStr.split('.');
          let result = realyData;
          const last = pathArray.pop();
          pathArray.forEach((path: string) => {
            result = result[ path ]
          });
          result[ last ] = val;
        },

        fetch () {
          return realyData;
        },
      }
    } else {
      return {
        fetch () {
          return realyData;
        },
      }
    }
  },
  Function: FunctionSymbol,
  String: StringSymbol,
  Number: NumberSymbol,
  Boolean: BooleanSymbol,
  Date: DateSymbol,
  Any: AnySymbol,
  Error: Errorymbol,
  Object: ObjectSymbol,
  Array: ArraySymbol,
  RegExp: RegexpSymbol,
  AsyncFunction: AsyncFunctionSymbol,
};
module.exports = exportObj;
