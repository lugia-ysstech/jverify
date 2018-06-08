#模块说明
用于单元测试过程中，对对象或者方法进行打桩出来。
#兼容说明
兼容浏览器IE9以上版本
#安装
npm install @lugai/jverify
#普通函数打桩

```
const { mockFunction } = require('@lugai/jverify');
const { create } = mockFunction;

const mock = create();
// 获取mock后的目标方法
const targetFunc = mock.getFunction();
mock.mock(() => 1);
// 直接指定返回值,PS：returned的优先级高于mock指定的返回值
// 如本例子，虽然指定了mock(()=>1)，但是会先将returned的返回值处理完成后
// 使用mock方法
mock.returned(100);
// 可指定多次返回值
mock.returned(101);

console.info(targetFunc(1));
console.info(targetFunc.bind({ t: 'a' })(2));
console.info(targetFunc.bind({ t: 'b' })(2));

console.info('方法调用次数', mock.callTimes());
console.info('方法调用的入参', mock.queryCallArgs());
console.info('方法调用绑定的this', mock.queryCallContext());
// 永远返回某个值
mock.forever('forever');
console.info('永远返回:', targetFunc(1));
console.info('永远返回:', targetFunc(1));
console.info('永远返回:', targetFunc(1));
// 重置
mock.restore();
console.info('方法调用次数', mock.callTimes());
console.info('方法调用的入参', mock.queryCallArgs());
console.info('方法调用绑定的this', mock.queryCallContext());
```
#对象打桩
##mock对象的方法
```
const { create } = mockObject;
const target = {
  name: 'old name',
  getName () {
    return this.name;
  },
};


const mockObjectTarget = create(target);

console.info('获取mock操作对象');
const mockFunction = mockObjectTarget.mockFunction('getName');

console.info(target.getName());
console.info('默认this 是对象本身');
console.info('方法调用绑定的this', target.getName());
mockFunction.queryCallContext();

console.info('改变原始方法绑定的this');
mockFunction.mockContext({ name: 'I am mock orgial!' });

console.info(target.getName());

console.info('指定mock方法的this为 {t: \'I am Mock\'}');
mockFunction.mock(() => 'mock jun', { t: 'I am Mock' });
console.info(`直接指定返回值,PS：returned的优先级高于mock指定的返回值
如本例子，虽然指定了mock(()=>1)，但是会先将returned的返回值处理完成后
 使用mock方法`);
mockFunction.returned('liming');
console.info('可指定多次返回值');
mockFunction.returned('xiaohong');

console.info(target.getName('a'));
console.info(target.getName('b'));
console.info(target.getName('c', 'd'));

console.log('方法调用次数', mockFunction.callTimes());
console.info('方法调用的入参', mockFunction.queryCallArgs());
console.info('方法调用绑定的this', mockFunction.queryCallContext());
// 永远返回某个值
mockFunction.forever('forever');
console.info('永远返回:', target.getName('a'));
console.info('永远返回:', target.getName('b'));
console.info('永远返回:', target.getName('c', 'd'));

console.info('重置mock对象的状态');
mockFunction.restore();
console.info('方法调用次数', mockFunction.callTimes());
console.info('方法调用的入参', mockFunction.queryCallArgs());
console.info('方法调用绑定的this', mockFunction.queryCallContext());

```
##mock对象的属性
```
const { mockObject } = require('@lugai/jverify');
const { create } = mockObject;
const target = {
  name: 'old name',
};


const mockObjectTarget = create(target);

console.info('获取mock操作对象');
const mockVar = mockObjectTarget.mockVar('name');

console.info(target.name);

mockVar.mock(() => 'mock jun');
console.info(`直接指定返回值,PS：returned的优先级高于mock指定的返回值
如本例子，虽然指定了mock(()=>1)，但是会先将returned的返回值处理完成后
 使用mock方法`);
mockVar.returned('liming');
console.info('可指定多次返回值');
mockVar.returned('xiaohong');

console.info(target.name);
console.info(target.name);
console.info(target.name);

console.log('方法调用次数', mockVar.callTimes());
// 永远返回某个值
mockVar.forever('forever');
console.info('永远返回:', target.name);
console.info('永远返回:', target.name);
console.info('永远返回:', target.name);

console.info('重置mock对象的状态');
mockVar.restore();
console.info('方法调用次数', mockVar.callTimes());

```
##restoreAll & restore
mockObject下mockVar、mockFunction对象，支持restore方法用于还原为原有处理。
mockFunction也支持restore方法用于还原原有处理。
为了方便处理，mockObject还提供了restoreAll用来还原所有的mockFunction与mockVar.

##VerifyOrder
用于进行mock对象之间顺序，以及方法mock对象的入参、this引用的检查。并给出响应错误信息的提示。
注意：当第3个步骤出错后，不会再去检查第3步骤后的相关步骤的具体错误。因为，实际开发过程中，也是对错误的不够逐一进行调整。
```
const { VerifyOrder, mockFunction, mockObject } = require('@lugai/jverify');
// mock 的目标对象
const obj = {
  f1 () {
  },
  v1: '1',
};
// 调用顺序验证器
const order = VerifyOrder.create();

// mock 对象
const mockObj = mockObject.create(obj, { mockName: 'a', verifyOrder: order });
// 模拟 方法：f1() 和 属性:v1
mockObj.mockFunction('f1');
mockObj.mockVar('v1');
// mock 一个普通方法
const mockFunc = mockFunction.create({ mockName: 'f1', verifyOrder: order });
const targetFunc = mockFunc.getFunction();
const ctx = { ctx: 'ctx' };
// 实际调用
targetFunc.call(ctx, 'hello');
obj.f1();
obj.v1;
obj.f1();
obj.v1;


// 期望调用顺序 正确调用顺序
order.verify(obj => {
  const { a, f1 } = obj;
  f1('hello').withContext(ctx);
  a.f1();
  a.v1;
  a.f1();
  a.v1;
});

try {

  // 上下未正确
  order.verify(obj => {
    const { a, f1 } = obj;
    f1('hello').withContext({});
    a.f1();
    a.v1;
    a.f1();
    a.v1;
  });
} catch (err) {
  console.error(err);
}

try {

  // 不正确的调用顺序
  order.verify(obj => {
    const { a, f1 } = obj;
    f1('hello');
    a.f1();
    a.v1;
    a.f1();
    a.v1;
    a.v1;
    a.v1;
  });
} catch (err) {
  console.error(err);
}

```
##reset & resetAll
mock对象方法的时候，存在一种情况。比如我们需要在nodejs环境下对Promise进行mock操作，可以按如下代码编写：
```
  const { mockObject } = require('@lugai/jverify');
  const globalMock = mockObject.create(global);
  globalMock.mockFunction('Promise').mock((resolve, reject)=>{
  });  
```
但是此时，即使使用restore进行还原也无法将Promise.all的方法还原回来，此时就可以通过reset或者mock对象中的resetAll方法进行还原成最原始的方法。
