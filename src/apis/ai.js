import request from '@/utils/request'

/**
 * 查询AI模板分类信息
 * @param {*} data 
 * @returns 
 */
export function getMerAiFaceCategoryPage(data) {
    return request({
        url: '/activity/activity/face/getMerAiFaceCategoryPage',
        method: 'post',
        data
    })
}

/**
 * 查询ai免费次数
 * @param {*} data 
 * @returns 
 */
export function getUserAiFreeTimes(data) {
    return request({
        url: '/activity/getUserAiFreeTimes',
        method: 'post',
        data
    })
}

/**
 * AI脱衣上传图片
 * @param {*} data 
 * @returns 
 */
export function uploadImg(data) {
    return request({
        url: '/activity/uploadImg',
        method: 'post',
        data
    })
}

/**
 * AI脱衣提交图片
 * @param {*} data 
 * @returns 
 */
export function submitAiPicture(data) {
    return request({
        url: '/activity/submitAiPicture',
        method: 'post',
        data
    })
}

/**
 * AI脱衣失败后重新提交图片
 * @param {*} data 
 * @returns 
 */
export function dealWithFail(data) {
    return request({
        url: '/activity/dealWithFail',
        method: 'post',
        data
    })
}

/**
 * 查询ai生成记录
 * @param {*} data 
 * @returns 
 */
export function getAiRecordPageList(data) {
    return request({
        url: '/activity/getAiRecordPageList',
        method: 'post',
        data
    })
}

/**
 * 删除ai记录
 * @param {*} data 
 * @returns 
 */
export function userDeletePic(data) {
    return request({
        url: '/activity/userDeletePic',
        method: 'post',
        data
    })
}

/**
 * 查询ai换脸模板
 * @param {*} data 
 * @returns 
 */
export function getFaceConfPageList(data) {
    return request({
        url: '/activity/face/getFaceConfPageList',
        method: 'post',
        data
    })
}

/**
 * 查询ai换脸图片免费次数
 * @param {*} data 
 * @returns 
 */
export function getAiPicFreeTimes(data) {
    return request({
        url: '/activity/face/getAiPicFreeTimes',
        method: 'post',
        data
    })
}

/**
 * 上传脸部照片
 * @param {*} data 
 * @returns 
 */
export function uploadAiFaceImg(data) {
    return request({
        url: '/activity/face/uploadAiFaceImg',
        method: 'post',
        data
    })
}

/**
 * 上传模板照片
 * @param {*} data 
 * @returns 
 */
export function uploadAiContentImg(data) {
    return request({
        url: '/activity/face/uploadAiContentImg',
        method: 'post',
        data
    })
}

/**
 * AI换脸提交
 * @param {*} data 
 * @returns 
 */
export function submitAiFacePicture(data) {
    return request({
        url: '/activity/face/submitAiFacePicture',
        method: 'post',
        data
    })
}

/**
 * AI换脸结果查询
 * @param {*} data 
 * @returns 
 */
export function getAiFaceResult(data) {
    return request({
        url: '/activity/face/getAiFaceResult',
        method: 'post',
        data
    })
}

/**
 * AI换脸删除结果
 * @param {*} data 
 * @returns 
 */
export function userDeleteAiface(data) {
    return request({
        url: '/activity/face/userDeleteAiface',
        method: 'post',
        data
    })
}

/**
 * 下载视频
 * @param {*} data 
 * @returns 
 */
export function userDownloadAiface(data) {
    return request({
        url: '/activity/face/userDownloadAiface',
        method: 'post',
        data
    })
}
