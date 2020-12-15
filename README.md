# tms-vue

基于 VUE 的前端开发基础框架和`tms-kos`配合使用。

# tms-event

全局消息插件。

安装

```javascript
import Vue from 'vue'
import { TmsEventPlugin } from 'tms-vue'

Vue.use(TmsEventPlugin)
```

发送消息

```javascript
this.$tmsEmit('hello')
```

接收消息

```javascript
this.$tmsOn('hello', () => {})
```

# axios

支持通过拦截器添加请求参数，处理业务逻辑错误。

## 创建实例

```javascript
import Vue from 'vue'
import { TmsAxiosPlugin } from 'tms-vue'

Vue.use(TmsAxiosPlugin)
// 注意不需要new，返回的不是Class，是工厂方法
let name = 'tms-axios-1'
let rules = [] // 见下面的说明
let config = {} // 参考axios的config
let tmsAxios = Vue.TmsAxios({ name, rules, config })
```

在 Vue 的组件中使用之前创建实例。

```javascript
let name = 'tms-axios-1'
let tmsAxios = this.TmsAxios(name)
```

不通过 Vue 使用之前创建的实例。

```javascript
import { TmsAxios } from 'tms-vue'
let name = 'tms-axios-1'
let tmsAxios = TmsAxios.ins(name)
```

## 指定拦截规则，给请求添加参数

```javascript
let rule = Vue.TmsAxios.newInterceptorRule({
  requestParams: new Map([['access_token', 'validaccesstoken']]),
})
let tmsAxios = TmsAxios.ins({ rules: [rule] })
```

参数可以通过函数提供，并且支持放回 promise，例如：

```javascript
requestParams: new Map([
  [
    'access_token',
    function () {
      return 'validaccesstoken'
    },
  ],
])
```

## 指定拦截规则，给请求添加头

```javascript
let rule = Vue.TmsAxios.newInterceptorRule({
  requestHeaders: new Map([['Authorization', 'Bearer valid-jwt']]),
})
let tmsAxios = TmsAxios.ins({ rules: [rule] })
```

请求头参数可以通过函数提供，并且支持放回 promise，例如：

```javascript
requestHeaders: new Map([
  [
    'Authorization',
    function () {
      return 'Bearer valid-jwt'
    },
  ],
])
```

## 指定拦截规则，重发请求

```javascript
let rule = Vue.TmsAxios.newInterceptorRule({
  onRetryAttempt: (res, rule) => {
    return new Promise((resolve) => {
      rule.requestParams.set('access_token', 'new_access_token')
      resolve(true)
    })
  },
})
let tmsAxiso = Vue.TmsAxios({ rules: [rule] })
```

如果有多个重发请求规则，只要任意一个发生异常（reject），就不进行重发；如果有任意一个需要重发（返回 resolve(true）)，就进行重发。

只允许重发一次。

## 指定拦截规则，业务逻辑错误处理（返回结果中 code 不等于 0）

```javascript
let rule = Vue.TmsAxios.newInterceptorRule({
  onResultFault: (res, rule) => {
    return new Promise((resolve) => {
      console.log('发生业务逻辑错误', res.data)
      resolve(true)
    })
  },
})
let tmsAxiso = Vue.TmsAxios({ rules: [rule] })
```

业务逻辑错误拦截器处理返回结果后，tms-vue 仍然会继续将执行 Promise.reject(res.data)，调用方应该使用 catch 进行接收。

使用方法参考测试用例：tms-axios.spec.js

发起请求的接口和 axios 一致，参考：https://github.com/axios/axios

## 指定连接规则，响应阶段失败处理

```javascript
rule = Vue.TmsAxios.newInterceptorRule({
  onResponseRejected: (err, rule) => {
    // 修复错误，或者转发错误
  },
})
let tmsAxios = Vue.TmsAxios({ rules: [rule] })
```

响应失败处理不是对业务错误的处理（参考：onResultFault）,是在响应阶段对发生的异常的处理，例如：希望对调用请求过程中发生的异常做统一处理（用统一的弹出框显示），那么就可以在这里实现。但是，需要注意这是 promise 调用链中的一环，调用仍然会继续，只是插入了一个处理环节。

# 执行批量任务类（Batch）

管理需要按批次执行的任务，例如：分页访问数据。

```js
import { Batch } from 'tms-vue'

const batch = new Batch((arg1, ..., argN, batchArg) => {}, arg1, ..., argN)
batch.size = 10
batch.next().then(({result,done})=>{...})
```

除了给要批次执行的方法传入固定的参数外，还会添加一个类型为`BatchArg`的示例记录批次执行状态（page 和 size）。

## 属性

| 属性       | 说明                                                                | 类型     | 默认值 |
| ---------- | ------------------------------------------------------------------- | -------- | ------ |
| action     | 需要按批次执行的方法                                                | function |        |
| actionArgs | 按批次执行方法的参数                                                | array    |        |
| page       | 批量任务的页号                                                      | number   | 0      |
| size       | 每一批的任务数量                                                    | number   | 1      |
| total      | 全部任务数量                                                        | number   |        |
| execPage   | 将要执行的批量任务页号，执行成功后赋值给 page                       | number   | 0      |
| tail       | 已完成的最 size 条任务的编号（只读，任务编号从 1 开始，page\*size） | number   |        |
| progress   | 当前进度，tail/total，只读                                          | string   |        |
| pages      | 总的页数                                                            | number   |        |

## 方法

### constructor

> let batch = new Batch(fnAction, ..., argN)

| 参数     | 说明                                       | 类型     |
| -------- | ------------------------------------------ | -------- |
| fnAction | 需要批量执行的方法，返回值必须为 Promise。 | function |
| argN     | 执行批量方法需要的参数。                   | any      |

如果 fnAction 的执行需要依赖特定的上下文，应该在传入前进行绑定。请参考单元测试中的用例。参数数量应该和方法需要的参数数量一致。

### exec

执行当前批次。该方法调用传入的批量方法。

返回当前批次执行的结果，和整体是否执行完成。

### next

执行下一个批次。

### goto

执行指定批次。

| 参数       | 说明       | 类型   |
| ---------- | ---------- | ------ |
| targetPage | 批次编号。 | number |

### startBatch

创建并执行 1 次批量任务。

| 参数                  | 说明                        | 类型     | 默认值 |
| --------------------- | --------------------------- | -------- | ------ |
| action                | 需要按批次执行的方法        | function |        |
| argsArray             | 按批次执行方法的参数        | array    |        |
| options               | 批次任务参数                | object   |        |
| options.size          | 每个批次包含任务数          | number   | 1      |
| options.firstCallback | 第 1 个批次执行完的回调函数 | function |        |

# lock-promise

# router-history
