import request from '@/utils/request'

/**
 * 获取任务列表
 * @param {*} data 
 * @returns 
 */
export function userGetTaskList(data) {
    return request({
        url: 'activity/tasklist/userGetTaskList',
        method: 'post',
        data
    })
}

/**
 * 领取任务
 * @param {*} data 
 * @returns 
 */
export function recieveTask(data) {
    return request({
        url: 'activity/taskClickdetail/recieveTask',
        method: 'post',
        data
    })
}

/**
 * 点击任务
 * @param {*} data 
 * @returns 
 */
export function clickTask(data) {
    return request({
        url: 'activity/taskClickdetail/clickTask',
        method: 'post',
        data
    })
}

/**
 * 邀请配置
 * @param {*} data 
 * @returns 
 */
export function userGetInviteConfig(data) {
    return request({
        url: 'activity/userGetInviteConfig',
        method: 'post',
        data
    })
}

/**
 * 可领取的奖励
 * @param {*} data 
 * @returns 
 */
export function getAvailableRecord(data) {
    return request({
        url: 'activity/getAvailableRecord',
        method: 'post',
        data
    })
}

/**
 * 领取邀请奖励
 * @param {*} data 
 * @returns 
 */
export function receiveRightNow(data) {
    return request({
        url: 'activity/receiveRightNow',
        method: 'post',
        data
    })
}

/**
 * 已邀请人信息
 * @param {*} data 
 * @returns 
 */
export function getInviteDetail(data) {
    return request({
        url: 'activity/getInviteDetail',
        method: 'post',
        data
    })
}

// 签到 配置
export function userGetSignConfig(data) {
    return request({
        url: 'activity/userGetSignConfig',
        method: 'post',
        data
    })
}

// 签到 今日是否已经签到
export function checkTodayisSign(data) {
    return request({
        url: 'activity/checkTodayisSign',
        method: 'post',
        data
    })
}

// 签到
export function usersign(data) {
    return request({
        url: 'activity/usersign',
        method: 'post',
        data
    })
}

// 签到 签到进度
export function chechIsFinishedDetail(data) {
    return request({
        url: 'activity/chechIsFinishedDetail',
        method: 'post',
        data
    })
}

// 签到 统计信息
export function getSignInformation(data) {
    return request({
        url: 'activity/getSignInformation',
        method: 'post',
        data
    })
}