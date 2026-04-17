import request from '@/utils/request'

// 查询会员支付
export function getMemberPay() {
  return request({
    url: `pay/memberPaySetting/get/v1`,
    method: 'post',
  })
}

// 获取支付方式
export function getPayTypeByMerAcct(data) {
  return request({
    url: '/system/paytype/getPayTypeByMerAcct',
    method: 'post',
    data
  })
}

// 获取金币支付配置
export function getGoldSetByMerchant(data) {
  return request({
    url: '/system/goldsetting/getGoldSetByMerchant',
    method: 'post',
    data
  })
}

// 金币充值接口 带支付通道
export function getGoldSetWithPayType(data) {
  return request({
    url: '/system/goldsetting/getGoldSetWithPayType',
    method: 'post',
    data
  })
}

// 获取用户购买会员的记录
export function payRecord(data) {
  return request({
    url: '/cluser/c/pay/record',
    method: 'post',
    data
  })
}

// 发起支付
export function postPay(data) {
    let deviceType = "pc"
    return request({
      url:`/pay/payPlatform/random/v1?payType=${data}`,
      method: 'get',
    //   data:data
    //   data:{deviceType,paySetId,payType,playerId,deviceId,playerIp}
    })
  }
// 订单查询
export function getOrderStatus(orderNo) {
  return request({
    url: `pay/order/status/v1?orderNo=${orderNo}`,
    method: 'get',
  })
}
