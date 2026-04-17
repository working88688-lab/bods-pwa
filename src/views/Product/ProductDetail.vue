<template>
  <div class="page-container flex-container">
    <div class="page-top">
      <Header textColor="#222222" :arrowBg="true" @onClickLeft="onBack" />
    </div>
    <div class="page-content">
      <Loading v-if="isInit" />
      <template v-else>
        <div class="empty-box" v-if="!productInfo">
          <van-empty :image="require('@/assets/images/emptyImage.png')" image-size="120" description="暂无数据哦~" />
        </div>
        <template v-else>
          <div class="product-image" :style="{
            'background-image':
              'url(' + imageBase + productInfo.product.productIcon + ')',
          }"></div>
          <div class="product-base">
            <div class="product-info">
              <div class="product-avatar">
                <img :src="imageBase + productInfo.product.productIcon" />
              </div>
              <div class="product-data">
                <div>{{ productInfo.product.productName }}</div>
                <div>
                  下载次数：<span>{{
                    formatNum(
                      productInfo.viewCount + productInfo.fakeViewCount
                    ) || 0
                  }}</span>
                </div>
              </div>
            </div>
            <div class="product-desc">
              <div class="product-desc-title">产品描述</div>
              <div class="product-desc-cont">
                {{ productInfo.product.productDetail }}
              </div>
            </div>
          </div>
          <div class="btn-box">
            <van-button round type="primary" @click="onFinish">
              <template v-if="(productInfo.payType === 1)">免费下载</template>
              <template v-else-if="(productInfo.payType === 2 && productInfo.preview)">{{ productInfo.goldPayUnit
              }}金币解锁</template>
              <template v-else-if="(productInfo.payType === 3 && productInfo.preview)">用户等级Lv{{ productInfo.userLevel || 0
              }}解锁</template>
              <template v-else-if="(productInfo.payType === 4 && productInfo.preview)">VIP解锁</template>
              <template v-else>下载</template>
            </van-button>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { getMediaById, purchase, viewAdd, productClick } from '@/apis/media'
import { formatStrNum, formatDuration } from '@/utils/tools'
import _ from 'lodash'
import Banner from '@/components/Banner'
import { Dialog } from 'vant'

export default {
  name: 'AnchorLike',
  components: {
    Header,
    Loading,
    Banner,
  },
  data() {
    return {
      isInit: true,
      productId: '',
      productInfo: null,
      isLoading: false,
      showDialog: false,
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    device() {
      return this.$store.state.device
    },
  },
  created() {
    this.getProductDetail()
  },
  activated() {
    if (!this.$route.query.productId) {
      this.$router.push('/product')
    } else {
      if (this.$route.query.productId !== this.productId) {
        this.isInit = true
        this.productInfo = null
        this.getProductDetail()
      }
    }
  },
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    onRoute(path, anchorInfo) {
      if (anchorInfo) {
        this.$router.push({
          path: path,
          query: {
            productId: anchorInfo.mediaId,
          },
        })
      } else {
        this.$router.push(path)
      }
    },
    async getProductDetail() {
      this.productId = this.$route.query.productId
      if (!this.productId) {
        return this.$router.push('/nudeChat')
      }
      const params = {
        mediaId: this.productId,
        mediaType: 6,
      }
      const res = await getMediaById(params).catch(() => {
        this.isInit = false
      })
      console.log(res, 'res')
      this.isInit = false
      if (res && res.code === 0) {
        this.productInfo = res.data
        viewAdd({
          mediaId: this.productInfo.mediaId,
          mediaType: this.productInfo.mediaType,
        })
      }
    },
    formatNum(num) {
      return formatStrNum(num)
    },
    formatDurationStr(num) {
      return formatDuration(num)
    },
    onClose() {
      this.showDialog = false
    },
    onFinish() {
      if (!this.productInfo.preview) {
        // 免费
        this.onJump()
      } else if (this.productInfo.payType === 2) {
        // 金币
        if (this.userInfo.coinBalance < this.productInfo.goldPayUnit) {
          return Dialog.confirm({
            title: '提示',
            message: '余额不足，是否立即充值',
            className: 'gold-dialog',
          })
            .then(async () => {
              this.$router.push('/recharge')
            })
            .catch(() => { })
        } else {
          Dialog.confirm({
            title: '提示',
            message: `是否花费${this.productInfo.goldPayUnit}金币解锁？`,
            className: 'gold-dialog',
          })
            .then(async () => {
              const params = {
                mediaId: this.productInfo.mediaId,
                mediaType: this.productInfo.mediaType,
              }
              const res = await purchase(params)
              if (res && res.code === 0) {
                this.productInfo.preview = false
                const userData = Object.assign({}, this.userInfo)
                userData.coinBalance =
                  userData.coinBalance - this.productInfo.goldPayUnit
                this.$store.commit('SET_USERINFO', userData)
                await this.getProductDetail()
                this.onJump()
              }
            })
            .catch(() => { })
        }
      } else if (this.productInfo.payType === 3) {
        // 用户等级
        if (this.userInfo.expLevel < this.productInfo.userLevel) {
          return Dialog.confirm({
            title: '提示',
            message: '等级不足，是否快速升级',
            className: 'gold-dialog',
          })
            .then(async () => {
              this.$router.push('/vip')
            })
            .catch(() => { })
        } else {
          this.onJump()
        }
      } else if (this.productInfo.payType === 4) {
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
            .catch(() => { })
        } else {
          this.onJump()
        }
      }
    },
    onJump() {
      if (this.productInfo.product.productJumpType === 1) {
        // 跳转app安装链接
        if (this.device === 'ios') {
          window.location.href = this.productInfo.productIosUrl
        } else if (this.device === 'android') {
          window.location.href = this.productInfo.productAndroidUrl
        } else {
          if (this.productInfo.product.productUrl) {
            window.open(this.productInfo.product.productUrl, '_blank')
          } else {
            Dialog.alert({
              message: '请使用手机访问',
              confirmButtonText: '确定',
            }).then(async () => { })
          }
        }
      } else {
        // 跳转下载落地页
        if (this.isApp) {
          // this.$store.commit('SET_PREVROUTE', this.$route.fullPath)
          // const jumpData = JSON.stringify({
          //     jumpTo: this.productInfo.product.productUrl
          // })
          // const jumpStr = encodeURI(jumpData)
          // this.$router.push({
          //     path: '/iframe',
          //     query: {
          //         jumpStr: jumpStr
          //     }
          // })
          window.open(this.productInfo.product.productUrl, '_self')
        } else {
          window.open(this.productInfo.product.productUrl, '_blank')
        }
      }
      productClick({ productId: this.productInfo.mediaId })
    },
  },
}
</script>

<style lang="less" scoped>
.page-top {
  position: fixed;
  z-index: 99;
}

.page-content {
  flex: 1;
  overflow: auto;
  position: relative;

  .product-image {
    width: 100%;
    height: 188px;
    background-size: cover;
    background-position: center 35%;
    background-repeat: no-repeat;
  }

  .product-base {
    width: 100%;
    min-height: calc(100vh - 188px);
    // background: url(../../assets/images/product_bg.png) top / 100% no-repeat;

    .product-info {
      padding: 52px 12px 12px;
      border-radius: 18px 18px 0 0;
      position: relative;
      z-index: 2;

      .product-avatar {
        width: 90px;
        height: 90px;
        border-radius: 6px;
        overflow: hidden;
        position: absolute;
        left: 32px;
        top: -25px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .product-data {
        position: absolute;
        left: 140px;
        top: 12px;
        font-size: 17px;

        >div:last-child {
          font-size: 14px;
          color: #bbbbbb;
          margin-top: 4px;

          span {
            color: var(--theme-color);
          }
        }
      }
    }

    .product-desc {
      padding: 24px 16px;

      .product-desc-title {
        font-size: 15px;
        margin-bottom: 10px;
      }

      .product-desc-cont {
        color: #bbbbbb;
        font-size: 14px;
      }
    }
  }

  .btn-box {
    position: fixed;
    bottom: 0;
    z-index: 99;
    width: 100%;
    padding: 16px 16px 32px;
    display: flex;
    justify-content: space-between;

    .van-button {
      width: 100%;
      height: 50px;
      border-radius: 25px;
      color: #fff;
      font-size: 18px;
      background: #d92514;
    }
  }
}</style>
