class TmsEvent {
    constructor(Vue) {
        this.hub = new Vue()
    }
    emit(...args) {
        this.hub.$emit(...args)
    }
    on(...args) {
        this.hub.$on(...args)
    }
}

export default function install(Vue) {
    let tmsEvent = new TmsEvent(Vue)
    Vue.prototype.$tmsEmit = tmsEvent.emit.bind(tmsEvent)
    Vue.prototype.$tmsOn = tmsEvent.on.bind(tmsEvent)
}