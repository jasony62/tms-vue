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

创建实例

```javascript
import Vue from 'vue'
import { TmsAxios } from 'tms-vue'

Vue.use(TmsAxios)
// 注意不需要new，返回的不是Class，是工厂方法
let name = 'tms-axios-1'
let tmsAxios = Vue.TmsAxios({ name })
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

指定拦截规则，给请求添加参数。

```javascript
let rule = Vue.TmsAxios.newInterceptorRule({
  requestParams: new Map([['access_token', 'invalidaccesstoken']])
})
let tmsAxios = TmsAxios.ins({ rules: [rule] })
```

指定拦截规则，重发请求。

```javascript
let rule = Vue.TmsAxios.newInterceptorRule({
  onRetryAttempt: (res, rule) => {
    return new Promise(resolve => {
      rule.requestParams.set('access_token', 'new_access_token')
      resolve(true)
    })
  }
})
let tmsAxiso = Vue.TmsAxios({ rules: [rule] })
```

如果有多个重发请求规则，只要任意一个发生异常（reject），就不进行重发；如果有任意一个需要重发（返回 resolve(true）)，就进行重发。

只允许重发一次。

使用方法参考测试用例：tms-axios.spec.js

发起请求的接口和 axios 一致，参考：https://github.com/axios/axios

# 执行批量任务类（Batch）

管理需要按批次执行的任务，例如：分页访问数据。

## 属性

| 属性       | 说明                                          | 类型     |
| ---------- | --------------------------------------------- | -------- |
| action     | 需要按批次执行的方法                          | function |
| actionArgs | 按批次执行方法的参数                          | array    |
| page       | 批量任务的页号                                | number   |
| size       | 每一批的任务数量                              | number   |
| total      | 全部任务数量                                  | number   |
| execPage   | 将要执行的批量任务页号，执行成功后赋值给 page | number   |

## 方法

### constructor

> let batch = new Batch(fnAction, ..., argN)

| 参数     | 说明                                       | 类型     |
| -------- | ------------------------------------------ | -------- |
| fnAction | 需要批量执行的方法，返回值必须为 Promise。 | function |
| argN     | 执行批量方法需要的参数。                   | any      |

如果 fnAction 的执行需要依赖特定的上下文，应该在传入前进行绑定。请参考单元测试中的用户。

### next

执行下一个批次。

### goto

执行指定批次。

| 参数       | 说明       | 类型   |
| ---------- | ---------- | ------ |
| targetPage | 批次编号。 | number |

### exec

执行当前批次。该方法调用传入的批量方法，并在参数列表
