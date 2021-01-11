// 消息总线
import TmsEventPlugin from './event'

// HTTP请求
import TmsErrorPlugin from './error'
import { TmsIgnorableError } from './error'

// HTTP请求
import TmsAxiosPlugin from './axios'
import { TmsAxios } from './axios'

// 批处理参数
import { Batch, startBatch } from './batch'

// 用promise实现锁机制
import { TmsLockPromise } from './lock-promise'

// 用promise实现锁机制
import TmsRouterHistoryPlugin from './router-history'
import { TmsRouterHistory } from './router-history'

// 运行时加载vue lib
import { tmsImportLib } from './runtime-lib'

export {
  TmsEventPlugin,
  TmsErrorPlugin,
  TmsIgnorableError,
  TmsAxiosPlugin,
  TmsAxios,
  Batch,
  startBatch,
  TmsLockPromise,
  TmsRouterHistoryPlugin,
  TmsRouterHistory,
  tmsImportLib,
}
