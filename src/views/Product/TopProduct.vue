<template>
  <div class="top-product" v-if="dataList.length">
    <div
      :class="'product-item ' + device"
      v-for="(data, idx) in dataList"
      :key="idx"
      @click="onPlay(data)"
    >
      <div class="product-img">
        <img
          v-lazy="
            data.product.productIcon.indexOf('http') > -1
              ? data.product.productIcon
              : imageBase + data.product.productIcon
          "
        />
      </div>
      <div class="product-cont">
        <div>{{ data.product.productName }}</div>
        <div>{{ data.product.productDetail }}</div>
      </div>
      <div class="product-down">下载</div>
    </div>
  </div>
</template>

<script>
import { purchase, productClick } from '@/apis/media'
import _ from 'lodash'
import { Dialog } from 'vant'

export default {
  name: 'TopProduct',
  components: {},
  props: {
    dataList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      page: {
        pageNo: 1,
        pageSize: 40,
      },
    }
  },
  computed: {
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    userInfo() {
      return this.$store.state.userInfo
    },
    isApp() {
      return this.$store.state.isApp
    },
    device() {
      return this.$store.state.device
    },
  },
  created() {},
  destroyed() {},
  mounted() {},
  methods: {
    async onPlay(data) {
      if (data.payType === 1) {
        // 免费
        this.onJump(data)
      } else if (data.payType === 2) {
        // 金币
        if (this.userInfo.coinBalance < data.goldPayUnit) {
          return Dialog.confirm({
            title: '提示',
            message: '余额不足，是否立即充值',
            className: 'gold-dialog',
          })
            .then(async () => {
              this.$router.push('/recharge')
            })
            .catch(() => {})
        } else {
          Dialog.confirm({
            title: '提示',
            message: `是否花费${data.goldPayUnit}金币解锁？`,
            className: 'gold-dialog',
          })
            .then(async () => {
              const params = {
                mediaId: data.mediaId,
                mediaType: data.mediaType,
              }
              const res = await purchase(params)
              if (res && res.code === 0) {
                const userData = Object.assign({}, this.userInfo)
                userData.coinBalance = userData.coinBalance - data.goldPayUnit
                this.$store.commit('SET_USERINFO', userData)
                this.onJump(data)
              }
            })
            .catch(() => {})
        }
      } else if (data.payType === 3) {
        // 用户等级
        if (this.userInfo.expLevel < data.userLevel) {
          return Dialog.confirm({
            title: '提示',
            message: '等级不足，是否快速升级',
            className: 'gold-dialog',
          })
            .then(async () => {
              this.$router.push('/vip')
            })
            .catch(() => {})
        } else {
          this.onJump(data)
        }
      } else if (data.payType === 4) {
        // VIP
        if (!this.userInfo.vipFlag) {
          return Dialog.confirm({
            title: '提示',
            message: '是否前往开通VIP',
            className: 'gold-dialog',
          })
            .then(async () => {
              this.$router.push('/vip')
            })
            .catch(() => {})
        } else {
          this.onJump(data)
        }
      }
    },
    onJump(data) {
      if (data.product.productJumpType === 1) {
        // 跳转app安装链接
        if (this.device === 'ios') {
          window.location.href = data.productIosUrl
        } else if (this.device === 'android') {
          window.location.href = data.productAndroidUrl
        } else {
          if (data.product.productUrl) {
            window.open(data.product.productUrl, '_blank')
          } else {
            Dialog.alert({
              message: '请使用手机访问',
              confirmButtonText: '确定',
            }).then(async () => {})
          }
        }
      } else {
        // 跳转下载落地页
        if (this.isApp) {
          window.open(data.product.productUrl, '_self')
        } else {
          window.open(data.product.productUrl, '_blank')
        }
      }
      productClick({ productId: data.mediaId })
    },
  },
}
</script>

<style lang="less" scoped>
.top-product {
  .top-product-title {
    font-size: 16px;
    color: #fff;
    margin: 14px 0;
    text-align: center;
  }

  .product-item {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    cursor: pointer;

    .product-img {
      width: 68px;
      height: 68px;
      border-radius: 5px;
      overflow: hidden;

      img {
        height: 100%;
      }
    }

    .product-cont {
      font-size: 14px;
      width: calc(100% - 122px);
      padding: 0 16px;

      > div:first-child {
        color: #666;
        margin-bottom: 2.66667vw;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 700;
      }

      > div:last-child {
        font-size: 3.2vw;
        color: #666;
        line-height: 1.5;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
    }

    .product-down {
      width: 14.4vw;
      height: 6.66667vw;
      line-height: 6.66667vw;
      text-align: center;
      background: #109fff;
      border-radius: 3.46667vw;
      font-size: 3.2vw;
      color: #fff;
    }
  }

  .product-item.pc {
    .product-img {
      width: 90px;
      height: 90px;
    }

    .product-cont {
      width: calc(100% - 144px);
    }
  }
}
</style>
