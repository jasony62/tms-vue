import axios from 'axios'

const Axios2Error = (function() {
    const _msg = new WeakMap()
    class Axios2Error {
        constructor(err) {
            if (typeof err === 'string')
                _msg.set(this, err)
            else if (typeof err === 'object' && err.msg)
                _msg.set(this, err.msg)
            else
                _msg.set(this.err.toString())
        }
        get msg() {
            return `axios2:${_msg.get(this)}`
        }
    }
    return Axios2Error
})()

/**
 * 请求拦截器中添加的参数
 */
class InterceptorRule {
    /**
     * 拦截规则
     * 
     * @param {Map<string,string>} requestParams 请求中添加参数，key作为名称，value作为值 
     * @param {function} 请求返回失败时的的处理 
     */
    constructor({ requestParams, onResponseFail }) {
        this.requestParams = requestParams
        this.onResponseFail = onResponseFail
    }
}

// 保存所有创建过的实例
const instances = new Map()

function useRequestInterceptor(tmsAxios, rules) {
    tmsAxios.interceptors.request.use(config => {
        if (config) {
            if (!config.params) config.params = {}
            rules.forEach(rule => {
                if (rule.requestParams) {
                    rule.requestParams.forEach((v, k) => {
                        config.params[k] = v
                    })
                }
            })
        }
        return config
    }, err => Promise.reject(err))
}

function useResponseInterceptor(tmsAxios, rules) {
    tmsAxios.interceptors.response.use(res => {
        if (res.data.code !== 0) {
            let resPromises = []
            if (rules && rules.length) {
                rules.forEach(rule => {
                    if (rule.onResponseFail)
                        resPromises.push(rule.onResponseFail(rule))
                })
                return Promise.all(resPromises)
                    .then(() => tmsAxios.request(res.config))
                    .then(res => res)
                    .catch(err => Promise.reject(new Axios2Error(err)))
            }
            return Promise.reject(res.data)
        }
        return res
    }, err => Promise.reject(err))
}
/**
 * 增强axios
 */
class TmsAxios {
    /**
     * 
     * @param {object} options 
     * @param {string} options.name 名称 
     * @param {Array<InterceptorRule>} options.rules 拦截规则
     * @param {object} options.config 默认axios实例配置规则
     */
    constructor({ name = null, rules = null, config = null } = {}) {
        let axios2 = axios.create(config)
        Object.assign(this, axios2)

        this.name = name || `tms_axios_${instances.size + 1}`
        this.rules = rules
        this.TmsAxios = TmsAxios
        instances.set(this.name, this)

        if (rules && Array.isArray(rules) && rules.length) {
            // 添加请求拦截器
            useRequestInterceptor(this, rules)
            // 添加响应拦截器
            useResponseInterceptor(this, rules)
        }
    }
    /**
     * 查找或创建一个实例
     * 
     * @param {*} nameOrConfig 实例的名称或新建参数，如果是字符串当作实例名称，如果是对象当作创建参数 
     * @param {string} nameOrConfig.name 实例名称 
     * @param {Array<InterceptorRule>} nameOrConfig.rules 拦截规则
     * @param {object} nameOrConfig.config 默认axios实例配置规则
     * 
     * @return {TmsAxios} 实例
     */
    static ins(nameOrConfig) {
        if (typeof nameOrConfig === 'string')
            return instances.get(nameOrConfig)
        if (undefined === nameOrConfig || typeof nameOrConfig === 'object')
            return new TmsAxios(nameOrConfig)

        return false
    }

    static remove(name) {
        return instances.delete(name)
    }
    /**
     * 创建拦截规则
     * 
     * @param {Map<string,string>} requestParams 请求中添加参数，key作为名称，value作为值 
     * @param {function} 请求返回失败时的的处理 
     * 
     * @return {InterceptorRule} 规则对象
     */
    static newInterceptorRule({ requestParams, onResponseFail }) {
        return new InterceptorRule({ requestParams, onResponseFail })
    }
}

export { TmsAxios }

export default function install(Vue) {
    Vue.TmsAxios = TmsAxios.ins
    Vue.TmsAxios.newInterceptorRule = TmsAxios.newInterceptorRule
    Vue.TmsAxios.remove = TmsAxios.remove
    Vue.prototype.TmsAxios = Vue.TmsAxios
}