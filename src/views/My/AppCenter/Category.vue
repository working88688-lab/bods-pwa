<template>
  <div class="page-content" :class="{ 'item-large': layout === 10 }">
    <Loading v-if="isInit" />
    <template v-else>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="empty-box" v-if="!dataList.length">
          <van-empty :image="require('@/assets/images/emptyImage.png')" image-size="120" description="暂无数据哦~" />
        </div>
        <van-list v-else v-model:loading="loading" :finished="finished" finished-text="没有更多了" class="movie-list"
          @load="onLoad">
          <div class="data-row">
            <template v-for="(data, idx) in dataList">
              <div :key="'layout' + idx" v-if="layout === 10" class="data-item item-large" @click="onPlay(data)">
                <img class="actor-img" v-lazy="data.product.productIcon.indexOf('http') > -1
                  ? data.product.productIcon
                  : imageBase + data.product.productIcon
                  " />
                <div class="actor-name">{{ data.product.productName }}</div>
              </div>
              <div :key="'item' + idx" v-else class="data-item" @click="onPlay(data)">
                <img class="actor-img" v-lazy="data.product.productIcon.indexOf('http') > -1
                  ? data.product.productIcon
                  : imageBase + data.product.productIcon
                  " />
                <div class="actor-info">
                  <div class="actor-name">{{ data.product.productName }}</div>
                  <div class="actor-desc">{{ data.product.productDetail }}</div>
                </div>
                <div class="btn-download">下载</div>
              </div>
            </template>
          </div>
        </van-list>
      </van-pull-refresh>
    </template>
  </div>
</template>

<script>
import Loading from '@/components/Loading'
import {
  listMediaBySearchType,
  purchase,
  useListAll,
  productClick,
} from '@/apis/media'
import { formatStrNum, formatDuration } from '@/utils/tools'
import _ from 'lodash'
import { Dialog } from 'vant'

export default {
  name: 'NudeChat',
  components: {
    Loading,
  },
  data() {
    return {
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      isInit: true,
      finished: false,
      dataList: [],
      refreshing: false,
      loading: false,
      loadmoreCategoryId: '',
      productList: [],
      layout: null,
      scrollTop: 0,
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    appFooter() {
      return this.$store.state.appFooter
    },
    isApp() {
      return this.$store.state.isApp
    },
  },
  created() {
    this.init()
  },
  activated() {
    if (this.$route.query.categoryId !== this.categoryId) {
      this.init()
    }
    this.$nextTick(() => {
      document.documentElement.scrollTop = this.scrollTop
    })
  },
  beforeRouteLeave(to, from, next) {
    this.scrollTop = document.documentElement.scrollTop
    next()
  },
  destroyed() { },
  methods: {
    init() {
      const { categoryId } = this.$route.query
      if (!categoryId) {
        return null
      }
      this.categoryId = categoryId
      this.isInit = true
      this.page.pageNo = 1
      this.dataList = []
      this.finished = false
      this.getProductList()
    },
    async getProductList() {
      const res = await useListAll({
        categoryId: this.categoryId,
        pageNo: 1,
        pageSize: 20,
      }).catch(() => {
        this.isInit = false
      })
      if (res && res.code === 0) {
        this.productList = res.data.dataList
        if (this.productList.length === 1) {
          this.loadmoreCategoryId = this.productList[0].categoryId
          this.layout = this.productList[0].style
          this.getDataList(null, true)
        } else {
          this.isInit = false
        }
      } else {
        this.isInit = false
      }
    },
    async getDataList(done, isRefresh) {
      let params = {
        ...this.page,
        mediaType: 6,
        orderType: 'SORT_PUBLISH',
        categoryId: this.loadmoreCategoryId,
      }
      this.loading = true
      const res = await listMediaBySearchType(params).catch(() => {
        this.isInit = false
        done && done()
        this.loading = false
        if (this.refreshing) {
          this.refreshing = false
        }
      })
      this.isInit = false
      done && done()
      this.loading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      if (res && res.code === 0) {
        const resultData = res.data.dataList
        if (isRefresh) {
          this.dataList = resultData
        } else {
          this.dataList = this.dataList.concat(resultData)
        }
        this.finished = this.page.pageNo * this.page.pageSize > res.data.total
      }
    },
    onRefresh(done) {
      this.page.pageNo = 1
      this.getDataList(done, true)
    },
    onLoad(done) {
      this.page.pageNo++
      this.getDataList(done)
    },
    formatNum(num) {
      return formatStrNum(num)
    },
    formatDurationStr(num) {
      return formatDuration(num)
    },
    async onPlay(data) {
      if (this.layout === 10) {
        this.$router.push({
          path: '/productDetail',
          query: {
            productId: data.mediaId,
          },
        })
      } else {
        if (data.payType === 1) {
          // 免费
          this.onJump(data)
        } else if (data.payType === 2) {
          // 金币
          if (this.userInfo.coinBalance < data.goldPayUnit) {
            return Dialog.confirm({
              title: '提示',
              message: '余额不足，是否立即充值',
              className: 'confirm-dialog',
            })
              .then(async () => {
                this.$router.push('/recharge')
              })
              .catch(() => { })
          } else {
            Dialog.confirm({
              title: '提示',
              message: `是否花费${data.goldPayUnit}金币解锁？`,
              className: 'confirm-dialog',
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
              .catch(() => { })
          }
        } else if (data.payType === 3) {
          // 用户等级
          if (this.userInfo.expLevel < data.userLevel) {
            return Dialog.confirm({
              title: '提示',
              message: '等级不足，是否快速升级',
              className: 'confirm-dialog',
            })
              .then(async () => {
                this.$router.push('/vip')
              })
              .catch(() => { })
          } else {
            this.onJump(data)
          }
        } else if (data.payType === 4) {
          // VIP
          if (!this.userInfo.vipFlag) {
            return Dialog.confirm({
              title: '提示',
              message: '是否前往开通VIP',
              className: 'confirm-dialog',
            })
              .then(async () => {
                this.$router.push('/vip')
              })
              .catch(() => { })
          } else {
            this.onJump(data)
          }
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
            }).then(async () => { })
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
.page-content {
  padding: 0 0 48px;
  // background: linear-gradient(rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
  margin: 0 16px;
  border-radius: 10px 10px 0 0;
  border-radius: 4px;
}

.page-content.item-large {
  padding: 0 0 48px;
  background: none;
}

.van-pull-refresh {
  min-height: 50vh;
}

.data-list {
  padding: 0 0 44px;
}

.data-row {
  display: flex;
  flex-flow: wrap;
}

.data-item {
  width: 100%;
  margin-bottom: 12px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  background: #fff;
  padding: 6px;
  border-radius: 5px;

  .actor-img {
    width: 54px;
    height: 54px;
    object-fit: cover;
    border-radius: 8px;
  }

  .actor-info {
    width: calc(100% - 108px);
    padding: 0 12px;

    .actor-name {
      font-size: 14px;
      color: #222222;
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .actor-desc {
      width: 100%;
      padding: 6px 0 0;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .btn-download {
    width: 54px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    border: 1px solid #109fff;
    box-sizing: border-box;
    color: #109fff;
    font-size: 12px;
    border-radius: 15px;
  }

  .btn-down {
    width: 75%;
    max-width: 80px;
    margin: 0 auto;
    display: block;
  }
}

.data-item.item-large {
  width: 100%;
  flex-wrap: wrap;

  .actor-img {
    width: 100%;
    height: auto;
  }

  .actor-name {
    margin-top: 6px;
    font-size: 14px;
    color: #222222;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
