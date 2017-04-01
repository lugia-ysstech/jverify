/**
 * Created by liguoxin on 2017/3/9.
 * @flow
 */


declare module 'vx-var-utils' {

  declare type Dir = "left" | "both" | "right";
  declare type PadArg = {
    str: string;
    len?: number;
    pad?: string;
    dir?: Dir;
  };

  declare type StringUtilsMethod = {|
    pad(arg: PadArg): string;
    truncate(str: string, length: number, chr: string): string;
    strlen(str: string): number;
    startsWith(str: string, condition: string): boolean;
    endsWith(str: string, condition: string): boolean;
    containWith(str: string, condition: string): boolean;
    |};

  declare type NumberUtilsMethod = {|
    limit(value: number, min: number, max: number): number
    |};
  declare type Match = {|
    match(str: string, condition: string): boolean;
    |}
  declare type ObjectUtilsMethod = {|

    /**
     * 从对象中匹配符合属性列，采用数组返回。
     * @condition 查询条件
     * @obj 查询的目标对象
     * @machFunc 匹配方法，默认为全匹配
     * @return 符合查询条件的数字
     */
    queryDataByKey<T>(obj: { [key: string]: T }, condition: string, match?: Match): Array<T>;
    /**
     * 对象转为数组
     */
    values(obj: Object): Array<any>;
    /**
     * 对象转为数组
     */
    |};
  declare type utils = {|
    NumberUtils: NumberUtilsMethod,
    StringUtils: StringUtilsMethod,
    ObjectUtils: ObjectUtilsMethod
    |};


  declare module.exports: utils;
}
