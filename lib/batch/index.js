/**
 * 按批次执行任务
 */
class BatchArg {
  constructor(page, size) {
    this.page = page
    this.size = size
  }
  toString() {
    return `${this.page},${this.size}`
  }
}

class Batch {
  /**
   * 创建执行批量任务对象
   *
   * @param {function} action 需要按批次执行的方法，需要返回Promise
   * @param  {...any} args
   */
  constructor(action, ...args) {
    this.action = action
    this.actionArgs = args
    this.page = 0
    this.execPage = 0
    this.size = 1
    this.total = null
  }
  /**
   * 指定批次是否在范围内
   *
   * @param {number} targetPage
   */
  inside(targetPage) {
    // 没有指定total，就允许一直执行
    if (typeof this.total !== 'number') return true

    let target = (targetPage - 1) * this.size

    return target <= this.total
  }
  /**
   * 是否有下一个批次
   */
  hasNext() {
    return this.inside(this.page + 1)
  }
  /**
   * 执行下一个批次
   */
  next() {
    if (!this.hasNext()) return Promise.resolve({ done: true })

    this.execPage = this.page
    this.execPage++

    return this.exec()
  }
  /**
   * 执行指定批次
   *
   * @param {number} targetPage
   */
  goto(targetPage) {
    if (!this.inside(targetPage)) return Promise.resolve({ done: true })

    this.execPage = targetPage

    return this.exec()
  }
  /**
   * 执行当前批次
   */
  exec() {
    let _this = this
    let { execPage: page, size } = this

    return this.action(...this.actionArgs, new BatchArg(page, size)).then(
      result => {
        _this.page = _this.execPage
        if (typeof result.total === 'number') this.total = result.total
        let done = !this.hasNext()
        return { result, done }
      }
    )
  }
}

export { Batch }
