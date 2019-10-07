const { Batch } = require('@/lib/batch')

describe('tms-batch', function() {
  it('基本使用', async () => {
    let total = 10
    let size = 4
    let action = jest.fn().mockReturnValue(Promise.resolve({ total }))
    let batch = new Batch(action)
    batch.size = size
    let result = await batch.next()
    expect(result.done).toBe(false)
    expect(batch.total).toBe(total)
    expect(action.mock.calls.length).toBe(1)
    let batchArg = action.mock.calls[0][0]
    expect(`${batchArg}`).toBe('1,4')
  })
  it('基本使用-绑定this', async () => {
    let total = 10
    let apis = {
      id: 'apis',
      action() {
        expect(this.id).toBe('apis')
        return Promise.resolve({ total })
      }
    }
    let size = 4
    let action = apis.action.bind(apis)
    let batch = new Batch(action)
    batch.size = size
    let result = await batch.next()
    expect(result.done).toBe(false)
    expect(batch.total).toBe(total)
  })
  it('基本使用-绑定this2', async () => {
    let total = 10
    class Apis {
      constructor() {
        this.id = 'apis'
      }
      action() {
        expect(this.id).toBe('apis')
        return Promise.resolve({ total })
      }
    }
    let size = 4
    let apis = new Apis()
    let action = apis.action.bind(apis)
    let batch = new Batch(action)
    batch.size = size
    let result = await batch.next()
    expect(result.done).toBe(false)
    expect(batch.total).toBe(total)
  })
  it('基本使用-按步骤执行', async () => {
    let total = 10
    let size = 4
    let actionParam1 = 1
    let action = jest.fn().mockReturnValue(Promise.resolve({ total }))
    let batch = new Batch(action, actionParam1)
    batch.size = size
    let batchPage = 0
    while (true) {
      let result = await batch.next()
      expect(batch.page).toBe(++batchPage)
      if (true === result.done) break
    }
    expect(action.mock.calls.length).toBe(3)
    expect(action.mock.calls[0][0]).toBe(actionParam1)
    expect(action.mock.calls[0][1]).toMatchObject({ page: 1, size })
    expect(action.mock.calls[1][0]).toBe(actionParam1)
    expect(action.mock.calls[1][1]).toMatchObject({ page: 2, size })
    expect(action.mock.calls[2][0]).toBe(actionParam1)
    expect(action.mock.calls[2][1]).toMatchObject({ page: 3, size })
    expect(batch.total).toBe(total)
  })
  it('基本使用-指定批次', async () => {
    let total = 10
    let size = 4
    let actionParam1 = 1
    let action = jest.fn().mockReturnValue(Promise.resolve({ total }))
    let batch = new Batch(action, actionParam1)
    batch.size = size
    let result = await batch.goto(3)
    expect(result.done).toBe(true)
    expect(action.mock.calls.length).toBe(1)
    expect(action.mock.calls[0][0]).toBe(actionParam1)
    expect(action.mock.calls[0][1]).toMatchObject({ page: 3, size })
    expect(batch.total).toBe(total)
  })
})
