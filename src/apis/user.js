import request from '@/utils/request'
import qs from 'qs'

// 获取设备码
export function getDeviceId(data) {
    return request({
        url: '/cluser/c/currentUserMac',
        method: 'post',
        data
    })
}

// 账号密码登录
export function login(data) {
    return request({
        url: '/cluser/c/user/login',
        method: 'post',
        data
    })
}

// 手机验证码登录
export function loginPhone(data) {
    return request({
        url: '/cluser/c/user/phone/login',
        method: 'post',
        data
    })
}

// mac登录
export function macLogin(data) {
    return request({
        url: '/cluser/c/user/mac/login',
        method: 'post',
        data
    })
}

// mac登录
export function useQrFindOldAccount(data) {
    return request({
        url: '/cluser/c/qrFindOldAccount',
        method: 'post',
        data
    })
}

//注册
export function register(data) {
    return request({
        url: `/user/h5/register/v1`,
        method: 'post',
        data
    })
}

//绑定手机号
export function bindPhone(data) {
    return request({
        url: `/cluser/c/user/bind/phone`,
        method: 'post',
        data
    })
}

// 获取个人中心信息
export function centerUserInfo(data) {
    return request({
        url: `/cluser/c/user/info/get`,
        method: 'post',
        data
    })
}

// 获取他人信息
export function getUserInfoById(data) {
    return request({
        url: `/cluser/c/user/info/other`,
        method: 'post',
        params: data
    })
}

// 刷新token
export function refreshToken(data) {
    return request({
        url: `/user/refreshToken/v1`,
        method: 'post',
        params: data
    })
}

// 修改用户信息
export function infoUpdate(data) {
    return request({
        url: '/cluser/c/user/info/update',
        method: 'post',
        data
    })
}

// 发送验证码到手机
export function sendCodePhone(data) {
    return request({
        url: '/cluser/c/user/sms/code',
        method: 'post',
        data
    })
}

// 绑定渠道码
export function bingInviteCode(data) {
    return request({
        url: '/cluser/c/user/bind/refer',
        method: 'post',
        params: data
    })
}

// 邀约记录
export function getInvites(pagNo, pageSize) {
    return request({
        url: `/user/invite/event/v1?pagNo=${pagNo}&pageSize=${pageSize}`,
        method: 'get',
    })
}

// vip层级信息
export function membervipLevel(data) {
    return request({
        url: '/system/vipsetting/getVipSettByMerchant',
        method: 'post',
        data
    })
}

// 开启的vip配置（带支付通道）
export function getVipSetWithPayType(data) {
    return request({
        url: '/system/vipsetting/getVipSetWithPayType',
        method: 'post',
        data
    })
}

// 根据id获取会员信息
export function queryUserInfoById(userId) {
    return request({
        url: `/user/otherUserInfo/v1?userId=${userId}`,
        method: 'get'
    })
}

// 点赞
export function like(data) {
    const str = qs.stringify(data)
    return request({
        url: `/social/like/v1?${str}`,
        method: 'put',
        data
    })
}

// 影片点赞
export function videoLike(data) {
    const str = qs.stringify(data)
    return request({
        url: `/content/video/like/v1?${str}`,
        method: 'put'
    })
}

// 购买vip、金币
export function pay(data) {
    return request({
        url: '/cluser/c/pay',
        method: 'post',
        data
    })
}

// 金币兑换VIP
export function exchangeVip(data) {
    return request({
        url: '/cluser/c/exchangeVip',
        method: 'post',
        data
    })
}

// 金币明细
export function transDetail(data) {
    return request({
        url: '/cluser/c/trans/detail/page',
        method: 'post',
        data
    })
}

// 收益 昨日 今日 累计，推广总人数
export function inviteTotal(data) {
    return request({
        url: '/cluser/c/invite/total',
        method: 'post',
        data
    })
}

// 收益明细
export function incomePage(data) {
    return request({
        url: '/cluser/c/invite/income/page',
        method: 'post',
        data
    })
}

// 收益明细
export function invitePage(data) {
    return request({
        url: '/cluser/c/invite/page',
        method: 'post',
        data
    })
}

// 关注
export function follow(data) {
    return request({
        url: '/cluser/c/follow',
        method: 'post',
        params: data
    })
}

// 关注列表
export function followedPage(data) {
    return request({
        url: '/cluser/c/follow/followed/page',
        method: 'post',
        data
    })
}

// 粉丝列表
export function followerPage(data) {
    return request({
        url: '/cluser/c/follow/follower/page',
        method: 'post',
        data
    })
}

// 消息列表
export function messagePage(data) {
    return request({
        url: '/cluser/c/message/page',
        method: 'post',
        data
    })
}

// 上传文件
export function uploadFile(data, config = {}) {
    return request({
        url: '/file/upload',
        method: 'post',
        data,
        ...config,
    })
}

// 上传视频文件，文件最大100Mb
export function uploadAsyShard(data, config) {
    return request({
        url: '/file/uploadAsyShard',
        method: 'post',
        data,
        config,
        onUploadProgress: config.onUploadProgress
    })
}

// 投稿
export function contribution(data) {
    return request({
        url: '/media/article/contribution',
        method: 'post',
        data
    })
}

// 提现信息
export function withdrawAcctInfo(data) {
    return request({
        url: '/cluser/c/withdraw/acct/list',
        method: 'post',
        data
    })
}

// 绑定账户提现信息
export function withdrawAcctBind(data) {
    return request({
        url: '/cluser/c/withdraw/acct/bind',
        method: 'post',
        data
    })
}

// 提现申请
export function withdrawApply(data) {
    return request({
        url: '/cluser/c/withdraw/apply',
        method: 'post',
        data
    })
}

// 提现申请记录
export function withdrawPage(data) {
    return request({
        url: '/cluser/c/withdraw/page',
        method: 'post',
        data
    })
}

// 提现申请记录
export function chatInfo(data) {
    return request({
        url: '/cluser/c/user/chat/info',
        method: 'post',
        data
    })
}

// 获取分享域名
export function shareDomain(data) {
    return request({
        url: '/cluser/c/user/share/domain',
        method: 'post',
        data
    })
}

// 打赏
export function tip(data) {
    return request({
        url: '/cluser/c/tip',
        method: 'post',
        data
    })
}

// 获取用户的粉丝和关注者数量
export function followTotal(data) {
    return request({
        url: '/media/follow/total',
        method: 'post',
        data
    })
}
// 获取所有banner
export function useBanner(data) {
    return request({
        url: '/system/banner/bannerListByMAcct',
        method: 'post',
        data
    })
}

// 查询当前用户vip信息
export function useDarkPermission(data) {
    return request({
        url: '/cluser/c/userCategoryPermission',
        method: 'post',
        data
    })
}

// 修改用户头像
export function changeHeadImg(data) {
    return request({
        url: '/cluser/c/userinfo/changeHeadImg',
        method: 'post',
        data
    })
}

// 修改用户签名
export function changeSignature(data) {
    return request({
        url: '/cluser/c/userinfo/changeSignature',
        method: 'post',
        data
    })
}
// 修改用户昵称
export function changeNickName(data) {
    return request({
        url: '/cluser/c/userinfo/changeNickName',
        method: 'post',
        data
    })
}
