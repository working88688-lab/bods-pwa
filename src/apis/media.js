import request from '@/utils/request'

/**
 * 获取线路配置
 * @param {*} data 
 * @returns 
 */
export function getCdnLineByMerAcct(data) {
    return request({
        url: '/system/cdnline/getCdnLineByMerAcct',
        method: 'post',
        data
    })
}

/**
 * 根据类型分页查询媒体
 * @param {*} data 
 * @returns 
 */
export function listMediaBySearchType(data) {
    return request({
        url: '/media/listMediaBySearchType',
        method: 'post',
        data
    })
}


/**
 * 根据二级分类id分组获取所有下级媒体 分野
 * @param {*} data 
 * @returns 
 */
export function useListAll(data) {
    return request({
        url: '/media/listAllBySecondCategoryIdNew',
        method: 'post',
        data
    })
}

// 获取根据上级目录id查询所有下级目录
export function listAllByParentId(data) {
    return request({
        url: '/media/category/listAllByParentId',
        method: 'post',
        data
    })
}


/**
 * 查询分类
 * @param {*} data 
 * @returns 
 */
export function listAllCategory(data) {
    return request({
        url: '/media/category/listAllCategory',
        method: 'post',
        data
    })
}

/**
 * 随机短视频列表
 * @param {*} data 
 * @returns 
 */
export function listShortVideoRandom(data) {
    return request({
        url: '/media/shortNewRandom',
        method: 'post',
        data
    })
}

/**
 * 根据id获取媒体详情
 * @param {*} data 
 * @returns 
 */
export function getMediaById(data) {
    return request({
        url: '/media/getMediaById',
        method: 'post',
        data
    })
}

/**
 * 点赞
 * @param {*} data 
 * @returns 
 */
export function favorAdd(data) {
    return request({
        url: '/media/favor/add',
        method: 'post',
        data
    })
}

/**
 * 根据媒体id分页获取评论
 * @param {*} data 
 * @returns 
 */
export function listCommentByMediaId(data) {
    return request({
        url: '/media/listCommentByMediaId',
        method: 'post',
        data
    })
}

/**
 * 评论
 * @param {*} data 
 * @returns 
 */
export function commentAdd(data) {
    return request({
        url: '/media/comment/add',
        method: 'post',
        data
    })
}

/**
 * 视频标记成已观看
 * @param {*} data 
 * @returns 
 */
export function viewAdd(data) {
    return request({
        url: '/media/view/add',
        method: 'post',
        data
    })
}

/**
 * 购买媒体
 * @param {*} data 
 * @returns 
 */
export function purchase(data) {
    return request({
        url: '/media/purchase',
        method: 'post',
        data
    })
}

/**
 * 查询热门标签
 * @param {*} data 
 * @returns 
 */
export function hotTag(data) {
    return request({
        url: '/media/hotTag',
        method: 'post',
        data
    })
}

/**
 * 搜索视频
 * @param {*} data 
 * @returns 
 */
export function searchMedia(data) {
    return request({
        url: '/media/search',
        method: 'post',
        data
    })
}

/**
 * 删除投稿
 * @param {*} data 
 * @returns 
 */
export function delContribution(data) {
    return request({
        url: '/media/delContribution',
        method: 'post',
        data
    })
}

/**
 * 投稿标签列表
 * @param {*} data 
 * @returns 
 */
export function tagListAll(data) {
    return request({
        url: '/media/tag/listAll',
        method: 'post',
        data
    })
}

/**
 * 预约主播
 * @param {*} data 
 * @returns 
 */
export function appointment(data) {
    return request({
        url: '/media/nude/appointment',
        method: 'post',
        data
    })
}

/**
 * 主播筛选条件
 * @param {*} data 
 * @returns 
 */
export function listAllType(data) {
    return request({
        url: '/media/nude/listAllType',
        method: 'post',
        data
    })
}

/**
 * 点击产品
 * @param {*} data 
 * @returns 
 */
export function productClick(data) {
    return request({
        url: '/media/product/click',
        method: 'post',
        params: data
    })
}

/**
 * 打赏/付费直播
 * @param {*} data 
 * @returns 
 */
export function anchorPurchase(data) {
    return request({
        url: '/media/anchor/purchase',
        method: 'post',
        data
    })
}

/**
 * 直播间互动消息
 * @param {*} data 
 * @returns 
 */
export function liveChatList(username) {
    return request({
        url: `https://zh.stripchat.com/api/front/v2/models/username/${username}/chat?source=regular`,
        method: 'get'
    })
}

/**
 * 收藏
 * @param {*} data 
 * @returns 
 */
export function collectMedia(data) {
    return request({
        url: '/media/collect',
        method: 'post',
        data
    })
}

/**
 * 取消收藏
 * @param {*} data 
 * @returns 
 */
export function cancelCollectMedia(data) {
    return request({
        url: '/media/cancelCollect',
        method: 'post',
        data
    })
}

/**
 * 获取视频时间节点标记信息
 * @param {*} data 
 * @returns 
 */
export function getvideoPreview(data) {
    return request({
        url: '/media/videoPreview/get',
        method: 'post',
        data
    })
}

/**
 * 购买服务项目
 * @param {*} data 
 * @returns 
 */
export function appointmentSever(data) {
    return request({
        url: '/media/nude/appointmentSever',
        method: 'post',
        data
    })
}

/**
 * 根据二级分类id分组获取所有影片
 * @param {*} data 
 * @returns 
 */
export function listPageBySecondCategoryId(data) {
    return request({
        url: '/media/listPageBySecondCategoryId',
        method: 'post',
        data
    })
}

/**
 * 视频反馈
 * @param {*} data 
 * @returns 
 */
export function commitIssue(data) {
    return request({
        url: '/media/commitIssue',
        method: 'post',
        data
    })
}