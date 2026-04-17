<template>
  <div class="page-content">
    <Loading v-if="isInit" />
    <template v-else>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="empty-box" v-if="!dataList.length">
          <van-empty :image="require('@/assets/images/emptyImage.png')" image-size="120" description="暂无数据哦~" />
        </div>
        <van-list v-else v-model:loading="loading" :finished="finished" finished-text="" @load="onLoad">
          <One v-if="layout === 10" :data="dataList" @item-click="onPlay" />
          <Two v-else-if="layout === 4" :data="dataList" @item-click="onPlay" />
          <Five v-else-if="layout === 0" :data="dataList" @item-click="onPlay" />
        </van-list>
      </van-pull-refresh>
    </template>
    <TopProduct :dataList="downloadList" />
  </div>
</template>

<script>
import Loading from '@/components/Loading'
import {
  listMediaBySearchType,
  purchase,
  productClick,
} from '@/apis/media'
import { formatStrNum, formatDuration } from '@/utils/tools'
import _ from 'lodash'
import { Dialog } from 'vant'
import TopProduct from './TopProduct'
import One from './components/one.vue'
import Two from './components/two.vue'
import Five from './components/five.vue'

export default {
  name: 'NudeChat',
  components: { Loading, TopProduct, One, Two, Five },
  props: {
    categoryId: String,
    layout: Number,
    downloadList: Array
  },
  data() {
    return {
      page: {
        pageNo: 1,
        pageSize: 40,
      },
      isInit: true,
      finished: false,
      dataList: [],
      refreshing: false,
      loading: false,
      loadmoreCategoryId: '',
      productList: [],
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
    this.getDataList()
  },
  activated() {
    this.$nextTick(() => {
      const mainDom = document.getElementsByClassName('page-main')
      if (mainDom && mainDom[0]) {
        mainDom[0].scrollTop = this.scrollTop
      }
    })
  },
  beforeRouteLeave(to, from, next) {
    const mainDom = document.getElementsByClassName('page-main')
    if (mainDom && mainDom[0]) {
      this.scrollTop = mainDom && mainDom[0].scrollTop
    }
    next()
  },
  destroyed() { },
  methods: {
    async getDataList() {
      let params = {
        ...this.page,
        mediaType: 6,
        orderType: 'SORT_PUBLISH_WEIGHT',
        categoryId: this.categoryId,
      }
      const res = await listMediaBySearchType(params).catch(() => {
        this.isInit && (this.isInit = false)
        this.refreshing && (this.refreshing = false)
        this.loading && (this.loading = false)
      })
      if (res && res.code === 0) {
        const resultData = res.data.dataList
        if (this.refreshing) {
          this.refreshing = false
          this.dataList = resultData
        } else {
          this.dataList = this.dataList.concat(resultData)
        }
        this.finished = this.page.pageNo * this.page.pageSize >= res.data.total
        this.isInit && (this.isInit = false)
        this.loading && (this.loading = false)
      }
    },
    onRefresh() {
      this.finished = false
      this.page.pageNo = 1
      this.getDataList()
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
              className: 'gold-dialog',
            })
              .then(async () => {
                this.$router.push('/recharge')
              })
              .catch(() => { })
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
              .catch(() => { })
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
              className: 'gold-dialog',
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
          // this.$store.commit('SET_PREVROUTE', this.$route.fullPath)
          // const jumpData = JSON.stringify({
          //     jumpTo: data.product.productUrl
          // })
          // const jumpStr = encodeURI(jumpData)
          // this.$router.push({
          //     path: '/iframe',
          //     query: {
          //         jumpStr: jumpStr
          //     }
          // })
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
  margin: 0 12px;
}
</style>
