/**
 * Created by liguoxin on 2017/3/14.
 * @flow
 */

declare module 'vx-mock' {

  declare interface BaseMockRequire {
    /*
     *还原为原始状态
     */
    restore(): void;
    /*
     * 符合调用次数
     */
    callTimes(): number;

    /**
     * 设置返回值，以此作为结果返回，优先级高于mock.
     */
    returned(arg: any): void;

  }

  declare type CallInfo = {
    context: Object,
    args: Array<any>
  }


  declare interface MockFuncCommonResult extends BaseMockRequire {
    /*
     * 设置桩函数
     */
    mock(func: Function, ctx?: Object): void;

    /*
     * 查询每一次调用对象的this上下文，以及入参，数组对应的顺序为调用的顺序
     */
    queryCallArgs(): Array<any>;
    /*
     * 获取第index次的调用参数信息
     */
    getCallArgs(index: number): Array<any>;
    /*
     * 查询每一次调用对象的this的上下文
     */
    queryCallContext(): Array<Object>;
    /*
     * 获取第index次的调用信息
     */
    getCallContext(index: number): any;
  }
  declare interface MockModuleFuncReulst extends MockFuncCommonResult, BaseMockRequire {
    /**
     * 直接mock掉原有方法的上下文,不会影响 mock() 指定的ctx.
     */
    mockContext(ctx: Object): void;
  }

  declare interface MockVarReulst extends BaseMockRequire {
    /*
     * 设置桩函数
     */
    mock(func: Object | string | number): void;
  }

  declare interface MockModule {
    /*
     * mock模块中的方法
     * @funcName 目标方法名
     */
    mockFunction(funcName: string): MockModuleFuncReulst;
    /*
     * mock模块中的变量
     * @varName 目标变量名
     */
    mockVar(varName: string): MockVarReulst;
  }


  declare interface ModuleMockFactory {
    /*
     * 创建mock模块
     * @modulePath mock模块的绝对地址，如果使用相对地址将无法正确加载模块
     */
    create(module: any, mockName: ?string, verifyOrder?: VerifyOrder): MockModule;
  }

  declare interface MockFunctionResult extends MockFuncCommonResult {
    getFunction(): Function;
  }

  declare interface MockFunctionFactory {
    /*
     * 创建mock模块
     * @modulePath mock模块的绝对地址，如果使用相对地址将无法正确加载模块
     */
    create(mockName: ?string, verifyOrder?: VerifyOrder): MockFunctionResult;
  }


  declare type MockObj = {
    name: string;
    mock: Object;
  };

  declare interface VerifyOrder {

    addModuleCallFunction(mock: MockObj, funcName: string, callInfo: CallInfo): void;
    addModuleVar(mock: Object): void;
    addCallFunction(callInfo: CallInfo): void;
    verify(): void;
  }

  declare interface VerifyOrderFactory {
    create(): VerifyOrder;
  }

  declare type ExportObj = {
    mockObject: ModuleMockFactory;
    mockFunction: MockFunctionFactory;
  }

  declare module.exports: ExportObj
}
