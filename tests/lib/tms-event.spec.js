import Vue from 'vue'
import { TmsEventPlugin } from '@/lib'

describe('tms-event', function() {
  it('安装，发送，接收', done => {
    Vue.use(TmsEventPlugin)
    let v = new Vue()
    v.$tmsOn('hello', data => {
      expect(data).toBe('data')
      done()
    })
    v.$tmsEmit('hello', 'data')
  })
})
