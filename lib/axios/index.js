import axios from 'axios'

/**
 * 请求拦截器中添加的参数
 */
class InterceptorRule {
    /**
     * 拦截规则
     * 
     * @param {Map<string,string>} requestParams 请求中添加参数，key作为名称，value作为值 
     * @param {function} 响应失败时，尝试重发请求 
     */
    constructor({ requestParams, onRetryAttempt }) {
        this.requestParams = requestParams
        this.onRetryAttempt = onRetryAttempt
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
            if (undefined === res.config.headers['TmsAxios-Retry']) {
                if (rules && rules.length) {
                    let retryPromises = []
                    rules.forEach(rule => {
                        if (rule.onRetryAttempt)
                            retryPromises.push(rule.onRetryAttempt(res, rule))
                    })
                    if (retryPromises.length) {
                        // 只允许尝试1次重发
                        res.config.headers['TmsAxios-Retry'] = 1
                        // 只要有1个规则支持重发就重发
                        return Promise.all(retryPromises)
                            .then(values => values.includes(true) ? tmsAxios.request(res.config) : Promise.reject(res.data))
                    }
                }
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
    static newInterceptorRule({ requestParams, onRetryAttempt }) {
        return new InterceptorRule({ requestParams, onRetryAttempt })
    }
}

export { TmsAxios }

export default function install(Vue) {
    Vue.TmsAxios = TmsAxios.ins
    Vue.TmsAxios.newInterceptorRule = TmsAxios.newInterceptorRule
    Vue.TmsAxios.remove = TmsAxios.remove
    Vue.prototype.TmsAxios = Vue.TmsAxios
}