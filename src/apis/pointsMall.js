import request from '@/utils/request'

/**
 * 获取服务器当前时间
 * @param {*} data 
 * @returns 
 */
export function getLocalTime(data) {
    return request({
        url: '/activity/getLocalTime',
        method: 'post',
        data
    })
}

/**
 * 获取每日福利任务及其进度
 * @param {*} data 
 * @returns 
 */
export function getDayTaskProgress(data) {
    return request({
        url: '/activity/getDayTaskProgress',
        method: 'post',
        data
    })
}

/**
 * 领取每日福利任务奖励
 * @param {*} data 
 * @returns 
 */
export function userReceiveDayTask(data) {
    return request({
        url: '/activity/userReceiveDayTask',
        method: 'post',
        data
    })
}

/**
 * 查询金币奖品
 * @param {*} data 
 * @returns 
 */
export function userGetAllProduct(data) {
    return request({
        url: '/activity/userGetAllProduct',
        method: 'post',
        data
    })
}

/**
 * 查询购买金币奖品记录
 * @param {*} data 
 * @returns 
 */
export function userGetAllRecord(data) {
    return request({
        url: '/activity/userGetAllRecord',
        method: 'post',
        data
    })
}

/**
 * 购买金币商品
 * @param {*} data 
 * @returns 
 */
export function userByProduct(data) {
    return request({
        url: '/activity/userByProduct',
        method: 'post',
        data
    })
}

/**
 * 查询金币商品详情
 * @param {*} data 
 * @returns 
 */
export function getProductDetail(data) {
    return request({
        url: '/activity/getProductDetail',
        method: 'post',
        data
    })
}
