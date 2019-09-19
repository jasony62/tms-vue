# tms-vue

基于 VUE 的前端开发基础框架和`tms-kos`配合使用。

# tms-event

全局消息插件。

安装

```javascript
import Vue from "vue"
import { TmsEventPlugin } from "tms-vue"

Vue.use(TmsEventPlugin)
```

发送消息

```javascript
this.$tmsEmit("hello")
```

接收消息

```javascript
this.$tmsOn("hello", () => {})
```

# axios

支持通过拦截器添加请求参数，处理业务逻辑错误。

创建实例

```javascript
import Vue from "vue"
import { TmsAxios } from "tms-vue"

Vue.use(TmsAxios)
// 注意不需要new，返回的不是Class，是工厂方法
let name = "tms-axios-1"
let tmsAxios = Vue.TmsAxios({ name })
```

在 Vue 的组件中使用之前创建实例。

```javascript
let name = "tms-axios-1"
let tmsAxios = this.TmsAxios(name)
```

不通过 Vue 使用之前创建的实例。

```javascript
import { TmsAxios } from "tms-vue"
let name = "tms-axios-1"
let tmsAxios = TmsAxios.ins(name)
```

使用方法参考测试用例：tms-axios.spec.js

发起请求的接口和 axios 一致，参考：https://github.com/axios/axios
