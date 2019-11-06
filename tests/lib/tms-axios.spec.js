import Vue from 'vue'
import { TmsAxiosPlugin, TmsAxios } from '@/lib'
import MockAdapter from 'axios-mock-adapter'

describe('tms-axios', function() {
  Vue.use(TmsAxiosPlugin)
  // it('创建实例', () => {
  //   let tmsAxios = Vue.TmsAxios()
  //   let { name } = tmsAxios
  //   let tmsAxios2 = Vue.TmsAxios(name)
  //   expect(tmsAxios2).toBe(tmsAxios)
  // })
  // it('创建指定名称的实例', () => {
  //   let tmsAxios = Vue.TmsAxios({ name: 'myAxios' })
  //   let tmsAxios2 = Vue.TmsAxios('myAxios')
  //   expect(tmsAxios2).toBe(tmsAxios)
  // })
  // it('Vue创建的实例，在非Vue代码中获取', () => {
  //   let tmsAxios = Vue.TmsAxios({ name: 'myAxios-1' })
  //   let tmsAxios2 = TmsAxios.ins('myAxios-1')
  //   expect(tmsAxios2).toBe(tmsAxios)
  // })
  // it('实例默认设置--baseURL', () => {
  //   let tmsAxiso = Vue.TmsAxios({ config: { baseURL: '/tms-vue/ue/api/' } })
  //   const mock = new MockAdapter(tmsAxiso)
  //   mock.onGet('/any').replyOnce(200, { code: 0, result: 'ok' })
  //   return tmsAxiso.get('/any').then(res => {
  //     expect(res.config.url).toBe('/tms-vue/ue/api/any')
  //   })
  // })
  // it('实例默认设置--Accept', () => {
  //   // 默认设置：'application/json, text/plain, */*'
  //   let tmsAxiso = Vue.TmsAxios({ config: { headers: { Accept: 'foo/bar' } } })
  //   const mock = new MockAdapter(tmsAxiso)
  //   mock.onGet('/any').replyOnce(200, { code: 0, result: 'ok' })
  //   return tmsAxiso.get('/any').then(res => {
  //     expect(res.config.headers['Accept']).toBe('foo/bar')
  //   })
  // })
  // it('添加access_token参数', () => {
  //   let rule = Vue.TmsAxios.newInterceptorRule({
  //     requestParams: new Map([['access_token', 'validaccesstoken']])
  //   })
  //   let tmsAxios = Vue.TmsAxios({ rules: [rule] })
  //   const mock = new MockAdapter(tmsAxios)
  //   mock.onGet('/api/any').reply(200, {
  //     code: 0,
  //     result: 'hello'
  //   })
  //   return tmsAxios.get('/api/any').then(rsp => {
  //     expect(rsp.data).toMatchObject({ code: 0, result: 'hello' })
  //     expect(rsp.config.params).toMatchObject({
  //       access_token: 'validaccesstoken'
  //     })
  //   })
  // })
  // it('返回业务逻辑错误', () => {
  //   let tmsAxiso = Vue.TmsAxios()
  //   const mock = new MockAdapter(tmsAxiso)
  //   mock
  //     .onGet('/api/any')
  //     .reply(200, { code: 10001, msg: '服务端业务逻辑错误' })
  //   return tmsAxiso.get('/api/any').catch(err => {
  //     expect(err.msg).toBe('服务端业务逻辑错误')
  //   })
  // })
  it('返回业务逻辑错误-拦截处理', () => {
    let mockOnResultFault = jest.fn().mockReturnValue(Promise.resolve(true))
    let rule = Vue.TmsAxios.newInterceptorRule({
      onResultFault: mockOnResultFault
    })
    let tmsAxiso = Vue.TmsAxios({ rules: [rule] })
    const mock = new MockAdapter(tmsAxiso)
    mock
      .onGet('/api/any')
      .reply(200, { code: 10001, msg: '服务端业务逻辑错误' })
    return tmsAxiso.get('/api/any').catch(err => {
      expect(mockOnResultFault.mock.calls.length).toBe(1)
      expect(mockOnResultFault.mock.calls[0][0]).toMatchObject({
        data: { code: 10001 }
      })
      expect(err.msg).toBe('服务端业务逻辑错误')
    })
  })
  // it('重发请求-重发', () => {
  //   let rule = Vue.TmsAxios.newInterceptorRule({
  //     onRetryAttempt: (res, rule) => {
  //       return Promise.resolve(true)
  //     }
  //   })
  //   let tmsAxiso = Vue.TmsAxios({ rules: [rule] })
  //   const mock = new MockAdapter(tmsAxiso)
  //   mock
  //     .onGet('/api/any')
  //     .replyOnce(200, { code: 10001, msg: '服务端业务逻辑错误' })
  //   mock.onGet('/api/any').replyOnce(200, { code: 0, result: 'ok' })
  //   return tmsAxiso.get('/api/any').then(res => {
  //     expect(res.data).toMatchObject({ code: 0, result: 'ok' })
  //   })
  // })
  // it('重发请求-不重发，收到原始错误信息', () => {
  //   let rule = Vue.TmsAxios.newInterceptorRule({
  //     onRetryAttempt: (res, rule) => {
  //       return Promise.resolve(false)
  //     }
  //   })
  //   let tmsAxiso = Vue.TmsAxios({ rules: [rule] })
  //   const mock = new MockAdapter(tmsAxiso)
  //   mock
  //     .onGet('/api/any')
  //     .replyOnce(200, { code: 10001, msg: '服务端业务逻辑错误' })
  //   return tmsAxiso.get('/api/any').catch(err => {
  //     expect(err).toMatchObject({ code: 10001, msg: '服务端业务逻辑错误' })
  //   })
  // })
  // it('重发请求-重发，处理重发请求异常', () => {
  //   let rule = Vue.TmsAxios.newInterceptorRule({
  //     onRetryAttempt: (res, rule) => {
  //       return Promise.reject('重发失败')
  //     }
  //   })
  //   let tmsAxiso = Vue.TmsAxios({ rules: [rule] })
  //   const mock = new MockAdapter(tmsAxiso)
  //   mock
  //     .onGet('/api/any')
  //     .replyOnce(200, { code: 10001, msg: '服务端业务逻辑错误' })
  //   return tmsAxiso.get('/api/any').catch(err => {
  //     expect(err).toBe('重发失败')
  //   })
  // })
  // it('重发请求-重发，重发请求失败', () => {
  //   let mockOnRetryAttempt = jest.fn().mockReturnValue(Promise.resolve(true))
  //   let rule = Vue.TmsAxios.newInterceptorRule({
  //     onRetryAttempt: mockOnRetryAttempt
  //   })
  //   let tmsAxiso = Vue.TmsAxios({ rules: [rule] })
  //   const mock = new MockAdapter(tmsAxiso)
  //   mock.onGet('/api/any').replyOnce(200, { code: 10001, msg: '第1次失败' })
  //   mock.onGet('/api/any').replyOnce(200, { code: 10002, msg: '第2次失败' })
  //   return tmsAxiso.get('/api/any').catch(err => {
  //     // 只允许进行1次重发
  //     expect(mockOnRetryAttempt.mock.calls).toHaveLength(1)
  //     expect(
  //       mockOnRetryAttempt.mock.calls[0][0].config.headers['TmsAxios-Retry']
  //     ).toBe(1)
  //     expect(err).toMatchObject({ code: 10002, msg: '第2次失败' })
  //   })
  // })
  // it('发出请求后，服务端响应access_token不可用，获得新access_token后，重发请求', () => {
  //   let rule = Vue.TmsAxios.newInterceptorRule({
  //     requestParams: new Map([['access_token', 'invalidaccesstoken']]),
  //     onRetryAttempt: (res, rule) => {
  //       return new Promise(resolve => {
  //         rule.requestParams.set('access_token', 'new_access_token')
  //         resolve(true)
  //       })
  //     }
  //   })
  //   let tmsAxiso = Vue.TmsAxios({ rules: [rule] })
  //   const mock = new MockAdapter(tmsAxiso)
  //   mock
  //     .onGet('/ue/api/any')
  //     .replyOnce(200, { code: 20001, msg: 'getting access_token failed' })
  //   mock.onGet('/ue/api/any').replyOnce(200, { code: 0, result: 'test' })
  //   return tmsAxiso.get('/ue/api/any').then(res => {
  //     expect(res.config.params).toMatchObject({
  //       access_token: 'new_access_token'
  //     })
  //     expect(res.data).toMatchObject({ code: 0, result: 'test' })
  //   })
  // })
})
