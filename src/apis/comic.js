import request from '@/utils/request'

/**
 * 根据二级分类id分组获取所有下级媒体
 * @param {*} data 
 * @returns 
 */
 export function listAllBySecondCategoryIdNew(data) {
    return request({
        url: '/comic/listAllBySecondCategoryIdNew',
        method: 'post',
        data
    })
}


/**
 * 根据类型分页查询媒体
 * @param {*} data 
 * @returns 
 */
 export function listMediaByPageAndSortType(data) {
    return request({
        url: '/comic/listMediaByPageAndSortType',
        method: 'post',
        data
    })
}


/**
 * 根据章节ID查询章节
 * @param {*} data 
 * @returns 
 */
 export function chapterById(data) {
    return request({
        url: '/comic/chapterById',
        method: 'post',
        data
    })
}


/**
 * 根据作品ID查询作品
 * @param {*} data 
 * @returns 
 */
 export function comicById(data) {
    return request({
        url: '/comic/comicById',
        method: 'post',
        data
    })
}


/**
 * 根据作品id 查询下面的章节
 * @param {*} data 
 * @returns 
 */
 export function pageChapterByComicId(data) {
    return request({
        url: '/comic/pageChapterByComicId',
        method: 'post',
        data
    })
}


/**
 * 点赞记录，收藏记录，观看记录，购买 记录，推荐
 * @param {*} data 
 * @returns 
 */
 export function listMediaBySearchType(data) {
    return request({
        url: '/comic/listMediaBySearchType',
        method: 'post',
        data
    })
}


/**
 * 搜索
 * @param {*} data 
 * @returns 
 */
 export function searchComic(data) {
    return request({
        url: '/comic/search2',
        method: 'post',
        data
    })
}


/**
 * 剧集分页
 * @param {*} data 
 * @returns 
 */
 export function chapterPage(data) {
    return request({
        url: '/comic/chapterPage',
        method: 'post',
        data
    })
}