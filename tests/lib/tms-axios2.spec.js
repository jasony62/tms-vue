/* eslint-disable no-console */
import axios from 'axios'
import Vue from 'vue'
import { TmsAxiosPlugin } from '@/lib'

Vue.config.productionTip = false

// 用一个需要长时间访问的链接测试超时
const slowurl = 'https://nodejs.org/dist/v12.14.0/node-v12.14.0.tar.gz'

describe('tms-axios', function() {
  Vue.use(TmsAxiosPlugin)
  it('设置请求超时', () => {
    let tmsAxios = Vue.TmsAxios()
    console.time('t1-r1')
    return tmsAxios.get(slowurl, { timeout: 100 }).catch(err => {
      console.timeEnd('t1-r1')
      expect(err.message).toBe('timeout of 100ms exceeded')
    })
  })
  it('取消超时请求', done => {
    let tmsAxios = Vue.TmsAxios()
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()
    console.time('t2-r1')
    tmsAxios.get(slowurl, { cancelToken: source.token }).catch(err => {
      console.timeEnd('t2-r1')
      expect(err.message).toBe('timeout of 100ms exceeded')
      done()
    })
    setTimeout(() => {
      source.cancel('timeout of 100ms exceeded')
    }, 100)
  })
  it('多个请求共享一个取消条件', () => {
    let tmsAxios = Vue.TmsAxios()
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    let p1 = new Promise(resolve => {
      console.time('t3-r1')
      tmsAxios.get(slowurl, { cancelToken: source.token }).catch(err => {
        console.timeEnd('t3-r1')
        expect(err.message).toBe('timeout of 100ms exceeded')
        resolve()
      })
    })
    let p2 = new Promise(resolve => {
      console.time('t3-r2')
      tmsAxios.get(slowurl, { cancelToken: source.token }).catch(err => {
        console.timeEnd('t3-r2')
        expect(err.message).toBe('timeout of 100ms exceeded')
        resolve()
      })
    })
    let p3 = new Promise(resolve => {
      console.time('t3-r3')
      tmsAxios.get(slowurl, { cancelToken: source.token }).catch(err => {
        console.timeEnd('t3-r3')
        expect(err.message).toBe('timeout of 100ms exceeded')
        resolve()
      })
    })
    setTimeout(() => {
      source.cancel('timeout of 100ms exceeded')
    }, 100)

    return Promise.all([p1, p2, p3])
  })
})
