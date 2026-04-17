<template>
  <div class="page-content">
    <Loading v-if="isInit" />
    <template v-else>
      <div class="banner-wraper" v-if="showBanner">
        <Banner
          ref="BannerRef"
          location="nakead"
          @onFinish="handleBannerFinish"
        />
      </div>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="empty-box" v-if="!dataList.length">
          <van-empty
            :image="require('@/assets/images/emptyImage.png')"
            image-size="120"
            description="暂无数据哦~"
          />
        </div>
        <van-list
          v-else
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          class="data-list"
          @load="onLoad"
        >
          <div class="data-row">
            <LouFengItem
              v-for="(data, idx) in dataList"
              :actorInfo="data"
              :key="idx"
            />
          </div>
        </van-list>
      </van-pull-refresh>
    </template>
  </div>
</template>

<script>
import Loading from '@/components/Loading'
import { listMediaBySearchType } from '@/apis/media'
import _ from 'lodash'
import SearchPopup from './SearchPopup'
import PubSub from 'pubsub-js'
import Banner from '@/components/Banner'
import LouFengItem from '@/components/LouFengItem'
import dayjs from 'dayjs'

export default {
  name: 'NudeChat',
  components: {
    Loading,
    SearchPopup,
    Banner,
    LouFengItem,
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
      city: '',
      isFavor: false,
      codeList: [],
      showBanner: true,
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
  },
  created() {
    const { categoryId } = this.$route.query
    if (categoryId === 'USER_FAVOR_RECORD') {
      this.isFavor = true
    } else {
      this.isFavor = false
    }
    this.categoryId = categoryId
    // this.getDataList()
    PubSub.subscribe('ON_SEARCH', (type, data) => {
      if (this.$route.query.categoryId === this.categoryId) {
        if (this.codeList !== data) {
          this.codeList = data
          this.page.pageNo = 1
          this.isInit = true
          this.finished = false
          this.dataList = []
          this.getDataList(null, true)
        }
      }
    })
  },
  activated() {
    // 第一次加载或者从详情页返回列表不刷新
    if (this.isInit) {
      return false
    }

    // 后台数据每天更新一次
    const currTime = dayjs().valueOf()
    if (currTime - this.$store.state.appLoadLouFengTime > 24 * 60 * 60 * 1000) {
      // 从楼凤详情页返回时，不变刷新列表
      if (this.$store.state.previousRoute !== '/anchorDetail') {
        this.showBanner = true
        this.page.pageNo = 1
        this.isInit = true
        this.finished = false
        this.dataList = []
        this.getDataList(null, true)
      }
    }
  },
  destroyed() {
    PubSub.unsubscribe('ON_SEARCH')
  },
  methods: {
    handleBannerFinish(data) {
      this.showBanner = !!data.length
    },
    async getDataList(done, isRefresh) {
      let params
      if (this.isFavor) {
        params = {
          ...this.page,
          mediaType: 4,
          searchType: 'USER_FAVOR_RECORD',
          searchItem: this.codeList || [],
        }
      } else {
        const targetMenu = this.appFooter.find(
          one => one.expand === '/nudeChat'
        )
        if (!targetMenu) {
          return this.$toast('获取分类信息失败')
        }
        const targetData = targetMenu.child.find(
          one => one.categoryId === this.categoryId
        )
        if (!targetData || !targetData.child || !targetData.child[0]) {
          return this.$toast('获取分类信息失败')
        }
        params = {
          ...this.page,
          mediaType: 4,
          orderType: 'SORT_PUBLISH',
          searchItem: this.codeList || [],
          categoryId: targetData.child[0].categoryId,
        }
      }
      this.$store.state.appLoadLouFengTime = dayjs().valueOf()
      this.loading = true
      const res = await listMediaBySearchType(params).catch(() => {
        this.isInit = false
        done && done()
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
  },
}
</script>

<style lang="less" scoped>
.page-content {
}
.banner-wraper {
  padding: 16px;
}
.van-pull-refresh {
  min-height: calc(100vh - 200px);
}
.data-list {
  padding: 0 16px;
}
.data-row {
  display: flex;
  flex-flow: wrap;
  justify-content: space-between;
}
</style>
