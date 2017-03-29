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
  }
  declare interface MockFuncReulst extends BaseMockRequire {
    /*
     * 设置桩函数
     */
    mock(func: Function): void;
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
    mockFunction(funcName: string): MockFuncReulst;
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
    create(module: any): MockModule;
  }


  declare type ExportObj = {
    mockRequire: ModuleMockFactory
  }

  declare module.exports: ExportObj
}
