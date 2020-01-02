/* eslint-disable no-console */
import Vue from 'vue'
import { TmsErrorPlugin, TmsIgnorableError } from '@/lib'

describe('tms-error', function() {
  it('默认处理方法', () => {
    let throwed = Error('some error')
    console.error = jest.fn()
    Vue.use({ install: TmsErrorPlugin })
    Vue.use(function() {
      new Vue({
        created() {
          throw throwed
        }
      })
    })
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error.mock.calls[0][0]).toBe(
      '异常: some error\nVue信息: created hook'
    )
  })
  it('VUE-指定处理方法', () => {
    let throwed = Error('some error')
    let mockHandler = jest.fn()
    Vue.use(
      { install: TmsErrorPlugin },
      {
        handler: mockHandler
      }
    )
    Vue.use(function() {
      new Vue({
        created() {
          throw throwed
        }
      })
    })
    expect(mockHandler).toHaveBeenCalledTimes(1)
    expect(mockHandler.mock.calls[0][0]).toBe(throwed)
  })
  it('VUE-忽略处理', () => {
    let mockHandler = jest.fn()
    Vue.use(
      { install: TmsErrorPlugin },
      {
        handler: mockHandler
      }
    )
    Vue.use(function() {
      new Vue({
        created() {
          throw new TmsIgnorableError('created error')
        }
      })
    })
    expect(mockHandler.mock.calls).toHaveLength(0)
  })
})
