import request from '@/utils/request'

// 群聊列表
export function chatRoomList() {
    return request({
        url: '/chat/api/getRoomDialogueList',
        method: 'post'
    })
}

// 获取个人信息
export function centerUserInfo() {
    return request({
        url: `https://52kbhl.com/front/api/chat/gmi`,
        method: 'post',
    })
}

// 进入房间
export function joinRoom(data) {
    return request({
        url: `/chat/api/getDialogueById`,
        method: 'post',
        data
    })
}

// 房间会话记录
export function romHisList(data) {
    return request({
        url: `/chat/api/getRoomHistoryByDialogueId`,
        method: 'post',
        data
    })
}

// 禁入用户
export function disableEnter(data) {
    return request({
        url: `/chat/api/blacklist/disableEnter`,
        method: 'post',
        data
    })
}

// 禁言用户
export function disableSpeak(data) {
    return request({
        url: `/chat/api/blacklist/disableSpeak`,
        method: 'post',
        data
    })
}

// 解除禁入
export function releaseEnter(data) {
    return request({
        url: `/chat/api/blacklist/releaseEnter`,
        method: 'post',
        data
    })
}

// 解除禁言
export function releaseSpeak(data) {
    return request({
        url: `/chat/api/blacklist/releaseSpeak`,
        method: 'post',
        data
    })
}

// 黑名单列表
export function blacklist(data) {
    return request({
        url: `/chat/api/blacklist/list`,
        method: 'post',
        data
    })
}

// 删除消息
export function deleteHistory(data) {
    return request({
        url: `/chat/api/history/delete`,
        method: 'post',
        data
    })
}


