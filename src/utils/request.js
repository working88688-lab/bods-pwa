import axios from "axios"
import store from '@/store'
import { decrypt } from '@/utils/aes'
import { Toast } from 'vant'

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
axios.defaults.headers['macct'] = process.env.VUE_APP_MERCHANTACCT
axios.defaults.headers['language'] = 'en_US'

const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API,
    timeout: 5000,
    adapter: retryAdapterEnhancer(axios.defaults.adapter, { times: 2 })
})

function retryAdapterEnhancer(adapter, options) {
    const { times = 0, delay = 300 } = options;
    return async (config) => {
        const { noRetry, retryTimes = times, retryDelay = delay } = config
        let __retryCount = 0;
        const request = async () => {
            try {
                return await adapter(config);
            } catch (err) {
                // 判断是否进行重试
                if (noRetry || !retryTimes || __retryCount >= retryTimes) {
                    return Promise.reject(err);
                }
                __retryCount++; // 增加重试次数
                // 延时处理
                const delay = new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, retryDelay);
                });
                // 重新发起请求
                return delay.then(() => {
                    return request();
                });
            }
        };
        return request();
    };
}

service.interceptors.request.use(config => {
    if (config.config) {
        const { timeout } = config.config
        config.timeout = timeout
    }
    if (store.state.token) { } {
        config.headers['token'] = store.state.token
    }
    // 0 ===> ios  1 ===> android  2 ===> h5  3 ===> web
    if (store.state.isApp) {
        config.headers['os'] = 0
    } else {
        config.headers['os'] = 2
    }
    config.headers['ver'] = '1.0'
    return config
})

service.interceptors.response.use(response => {
    const respData = JSON.parse(decrypt(response.data))
    if (respData.code === 6) {
        // token失效，重新登录
        store.dispatch('macLogin')
        return respData
    } else if (respData.code !== 0) {
        Toast(respData.msg)
        return respData
    } else {
        return respData
    }
}, error => {
    return error
})

export default service
