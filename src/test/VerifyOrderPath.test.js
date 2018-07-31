/**
 * Created by liguoxin on 2017/3/1.
 * @flow
 */
const VerifyOrder = require('../lib/VerifyOrder');

describe('VerifyOrderPath', function () {

  it('parseObject fetch', () => {
    const param = { one: '1', two: '2' };
    const { fetch } = VerifyOrder.parseObject(param);
    expect(fetch()).not.toBe(param);
    expect(fetch()).toEqual(param);
  });
  it('parseObject string', () => {
    const { fetch } = VerifyOrder.parseObject('');
    expect(fetch()).toEqual('数据类型错误');
  });

  it('parseObject getValue 1 level', () => {
    const param = { one: '1', two: '2' };
    const { getValue, } = VerifyOrder.parseObject(param);
    expect(getValue('one')).toBe(param.one);
    expect(getValue('two')).toBe(param.two);
  });
  it('parseObject getValue  array', () => {
    const param = [ 1, 2, 3, ];
    const { getValue, } = VerifyOrder.parseObject(param);
    expect(getValue('0')).toBe(param[ 0 ]);
    expect(getValue('1')).toBe(param[ 1 ]);
    expect(getValue('2')).toBe(param[ 2 ]);
  });

  it('parseObject getValue  array 2 level', () => {
    const param = [ { a: '1' }, { b: '2' }, { c: '3' }, ];
    const { getValue, } = VerifyOrder.parseObject(param);
    expect(getValue('0.a')).toBe(param[ 0 ].a);
    expect(getValue('0.b')).toBe(param[ 0 ].b);
    expect(getValue('0.c')).toBe(param[ 0 ].c);
  });

  it('parseObject getValue  array 2 level', () => {
    const param = [ { a: [ 1, 2, 3 ] }, ];
    const { getValue, } = VerifyOrder.parseObject(param);
    expect(getValue('0.a.2')).toBe(3);
  });


  it('parseObject getValue  array 2 level', () => {
    const param = { array: [ { a: [ 1 ] }, 5 ] };
    const { getValue, } = VerifyOrder.parseObject(param);
    expect(getValue('array.0.a')).toEqual([ 1 ]);
    expect(getValue('array.0.a.0')).toEqual(1);
    expect(getValue('array.1')).toEqual(5);
  });


  it('parseObject getValue 2 level', () => {
    const param = { one: { a: 1, c: 3 }, two: { b: 2 }, three: 'hello' };
    const { getValue, } = VerifyOrder.parseObject(param);
    expect(getValue('one.a')).toBe(param.one.a);
    expect(getValue('one.c')).toBe(param.one.c);
    expect(getValue('two.b')).toBe(param.two.b);
    expect(getValue('three')).toBe(param.three);
  });


  it('parseObject setValue  object 1 level', () => {
    const param = { one: 'hello' };
    const { setValue, fetch } = VerifyOrder.parseObject(param);
    setValue('one', 'world');
    expect(fetch()).toEqual({ one: 'world' });
  });

  it('parseObject setValue  object 3 level', () => {
    const param = { one: { two: { three: '' } } };
    const { setValue, fetch } = VerifyOrder.parseObject(param);
    setValue('one.two.three', 'hello');
    expect(fetch()).toEqual({ one: { two: { three: 'hello' } } });
    expect(param).toEqual({ one: { two: { three: '' } } });
  });

  it('parseObject setValue  object 3 level', () => {
    const paramA = { one: { two: { three: '' } } };
    const paramB = { one: { two: { three: '' } } };
    paramA.b = paramB;
    paramB.a = paramA;
    const { setValue, fetch } = VerifyOrder.parseObject(paramA);
    setValue('b.one', 'b.one');
    let target = fetch();
    expect(target).toEqual({ one: { two: { three: '' } }, b: { one: 'b.one', a: target } });
  });

  it('parseObject setValue  array ', () => {
    const param = [];
    const { setValue, fetch } = VerifyOrder.parseObject(param);
    setValue('0', 'a');
    setValue('1', 'b');
    setValue('2', 'c');
    expect(fetch()).toEqual([ 'a', 'b', 'c' ]);
  });

  it('parseObject setValue  getValue for Error Param ', () => {
    const param = [];
    const { setValue, getValue } = VerifyOrder.parseObject(param);
    expect(() => { setValue(null, 'a');}).toThrow('path参数错误');
    expect(() => { getValue(null);}).toThrow('path参数错误');
    expect(() => { getValue([]);}).toThrow('path参数错误');
  });


});
