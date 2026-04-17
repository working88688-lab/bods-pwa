import request from '@/utils/request'
import qs from 'qs'

// 获取Banner
export function banner(data) {
    return request({
        url: '/system/bannersetting/userGetBannerSet',
        method: 'post',
        data
    })
}

// 统计点击banner次数
export function clickBanner(data) {
    return request({
        url: '/system/bannersetting/clickBanner',
        method: 'post',
        data
    })
}

// 获取动态信息
export function dynamic(data) {
    const str = qs.stringify(data)
    return request({
        url: `/data/list/dynamic/v1?${str}`,
        method: 'post',
        data
    })
}

// 获取站点数据字典配置
export function getDicByKeys(data) {
    return request({
        url: '/system/datadictionary/getDicByKeys',
        method: 'post',
        data
    })
}

// 获取落地页域名列表
export function useDomain(data) {
    return request({
        url: '/cluser/c/queryDomainByMerchant',
        method: 'post',
        data
    })
}