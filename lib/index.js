// 消息总线
import TmsEventPlugin from './event'

// HTTP请求
import TmsErrorPlugin from './error'
import { TmsIgnorableError } from './error'

// HTTP请求
import TmsAxiosPlugin from './axios'
import { TmsAxios } from './axios'

// 批处理参数
import { Batch } from './batch'

// 用promise实现锁机制
import { TmsLockPromise } from './lock-promise'

export {
  TmsEventPlugin,
  TmsErrorPlugin,
  TmsIgnorableError,
  TmsAxiosPlugin,
  TmsAxios,
  Batch,
  TmsLockPromise
}
