import Vue from 'vue'
import { TmsAxiosPlugin } from '@/lib'
import Mock from 'mockjs'
import MockAdapter from 'axios-mock-adapter'

Vue.config.productionTip = false

describe('tms-axios', function() {
  Vue.use(TmsAxiosPlugin)
  it('挂起请求等待异步操作结果', done => {
    let rule = Vue.TmsAxios.newInterceptorRule({
      requestParams: new Map([
        [
          'access_token',
          () =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve('validaccesstoken')
              }, 1000)
            })
        ]
      ])
    })
    let tmsAxios = Vue.TmsAxios({ rules: [rule] })
    const mock = new MockAdapter(tmsAxios)
    mock.onGet('/api/any').reply(200, {
      code: 0,
      result: 'hello'
    })
    tmsAxios.get('/api/any').then(rsp => {
      expect(rsp.data).toMatchObject({ code: 0, result: 'hello' })
      expect(rsp.config.params).toMatchObject({
        access_token: 'validaccesstoken'
      })
      done()
    })
  })
  it('挂起多个请求等待1个共享的异步操作结果', done => {
    const MockedAccessToken = Mock.Random.string('lower', 32)
    function getSharePromise() {
      let promise
      return (() => {
        if (!promise) {
          promise = new Promise(resolve => {
            setTimeout(() => {
              resolve(MockedAccessToken)
            }, 1000)
          })
        }
        return promise
      })()
    }
    let rule = Vue.TmsAxios.newInterceptorRule({
      requestParams: new Map([['access_token', getSharePromise]])
    })
    let tmsAxios = Vue.TmsAxios({ rules: [rule] })
    const mock = new MockAdapter(tmsAxios)
    mock.onGet('/api/any').reply(200, {
      code: 0,
      result: 'hello'
    })
    mock.onGet('/api/any2').reply(200, {
      code: 0,
      result: 'hello2'
    })
    mock.onGet('/api/any3').reply(200, {
      code: 0,
      result: 'hello3'
    })
    let p1, p2, p3
    p1 = tmsAxios.get('/api/any').then(rsp => {
      expect(rsp.config.params).toMatchObject({
        access_token: MockedAccessToken
      })
      expect(rsp.data).toMatchObject({ code: 0, result: 'hello' })
    })
    p2 = tmsAxios.get('/api/any2').then(rsp => {
      expect(rsp.config.params).toMatchObject({
        access_token: MockedAccessToken
      })
      expect(rsp.data).toMatchObject({ code: 0, result: 'hello2' })
    })
    p3 = tmsAxios.get('/api/any3').then(rsp => {
      expect(rsp.config.params).toMatchObject({
        access_token: MockedAccessToken
      })
      expect(rsp.data).toMatchObject({ code: 0, result: 'hello3' })
    })

    Promise.all([p1, p2, p3]).then(() => done())
  })
})
