import request from '@/utils/request'

// 视频点赞
export function videoLike(data) {
    return request({
        url: `content/video/like/v1?videoId=${data.videoId}&type=${data.type}`,
        method: 'put'
    })
}

// 视频点赞
export function videoEnd(videoId,degree) {
    return request({
        url: `content/video/player/of/v1?videoId=${videoId}&degree=${degree}`,
        method: 'put'
    })
}
// 视频开始
export function videoStart(videoId) {
    return request({
        url: `content/video/player/member/v1?videoId=${videoId}`,
        method: 'put',
    })
}



// 获取短视频评论
export function commentList(data) {
    return request({
        url: `content/list/comment/v1`,
        method: 'post',
        data
    })
}

// 评论
export function comment(data) {
    return request({
        url: `content/video/comment/v1`,
        method: 'post',
        data
    })
}

// 评论
export function getVideoInfo() {
    return request({
        url: `content/video/player/member/v1`,
        method: 'get',
    })
}

