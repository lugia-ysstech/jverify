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
    context?: Object,
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
    /*
     * 重置mock目标对象的所有方法或变量。变为使用原有方法及原有值进行处理
     */
    restoreAll(): void;
  }

  declare type VerifyOrderConfig = {
    mockName: string;
    verifyOrder: VerifyOrder;
  }
  declare interface ModuleMockFactory {
    /*
     * 创建mock模块
     * @modulePath mock模块的绝对地址，如果使用相对地址将无法正确加载模块
     */
    create(module: any, orderConfig?: VerifyOrderConfig): MockModule;
  }

  declare interface MockFunctionResult extends MockFuncCommonResult {
    getFunction(): Function;
  }

  declare interface MockFunctionFactory {
    /*
     * 创建mock模块
     * @modulePath mock模块的绝对地址，如果使用相对地址将无法正确加载模块
     */
    create(orderConfig?: VerifyOrderConfig): MockFunctionResult;
  }

  declare type MockType = 'func' | 'module_func' | 'module_var'
  declare type VerifyOrderMock = {
    name?: string;
    type: MockType
  }
  declare type OrderStep = {
    name: string;
    mockName: string;
    callInfo?: CallInfo;
    type: MockType
  }
  declare type VerifyOrderMockList = { [key: string]: Array<VerifyOrderMock>; }
  declare type ModuleVarStatus = { [key: string]: boolean }

  declare interface VerifyOrder {

    addModuleCallFunction(mockName: string, funcName: string, callInfo: ?CallInfo): void;
    addModuleVar(mockName: string, attrName: string): void;
    addCallFunction(mockName: string, callInfo: ?CallInfo): void;
    verify(callback: Function): void;
  }


  declare interface VerifyOrderFactory {
    create(): VerifyOrder;
  }

  declare interface VerifyOrderConfigFactory {
    create(mockName: string, order: VerifyOrder): VerifyOrderConfig;
  }

  declare type VerifyResultErrorInfo = { [key: number]: Array<string> };
  declare type VerifyResult = {|
    sucess: boolean;
    error: VerifyResultErrorInfo;
  |}
  declare type ExportObj = {
    mockObject: ModuleMockFactory;
    mockFunction: MockFunctionFactory;
    VerifyOrder: VerifyOrderFactory;
    VerifyOrderConfig: VerifyOrderConfigFactory;
  }

  declare type GenerateErrorFuncArg = {
    mockNameIsEql?: boolean;
    nameIsEql?: boolean;
    argIsEql?: boolean;
    stepError?: boolean;
    ctxIsEql?: boolean;
  }
  declare type VarNameObserve = { [key: string]: boolean };
  declare module.exports: ExportObj
}
