<template>
  <div>
    <div class="page-content">
      <Loading v-if="isInit" />
      <template v-else>
        <div class="collect-anchor" @click="onRoute('/collectAnchor')">
          <div>
            我收藏的主播
            <!-- <span class="text-yellow">10</span> 人正在 -->
          </div>
          <div>
            <span>查看全部</span>
            <img src="@/assets/images/right-c.png" alt="" />
          </div>
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
              <template v-for="(data, idx) in dataList">
                <div
                  class="data-item banner"
                  v-if="data.type === 'banner'"
                  :key="'banner' + idx"
                >
                  <Advertise :banner="data.data" />
                  <div class="banner-title">{{ data.data.bannerName }}</div>
                </div>
                <LiveItem v-else :liveInfo="data" :key="idx" />
              </template>
            </div>
          </van-list>
        </van-pull-refresh>
      </template>
    </div>
    <Footer activePath="/streaming" />
  </div>
</template>

<script>
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Loading from '@/components/Loading'
import LiveItem from '@/components/LiveItem'
import { listMediaBySearchType, anchorPurchase } from '@/apis/media'
import PubSub from 'pubsub-js'
import _ from 'lodash'
import Advertise from '@/components/Advertise'
import dayjs from 'dayjs'

export default {
  name: 'StreamingCategory',
  components: {
    Header,
    Footer,
    Loading,
    LiveItem,
    Advertise,
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
    bannerList() {
      if (this.$store.state.banner && this.$store.state.banner['STREAM_ad']) {
        return this.$store.state.banner['STREAM_ad']
      } else {
        return []
      }
    },
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
      searchData: {},
    }
  },
  created() {
    const { categoryId } = this.$route.query
    this.categoryId = categoryId
    PubSub.subscribe('ON_SEARCHLIVE', (type, data) => {
      if (_.isEqual(this.searchData, data) === false) {
        this.searchData = _.cloneDeep(data)
        this.page.pageNo = 1
        this.isInit = true
        this.finished = false
        this.dataList = []
        this.getDataList(null, true)
      }
    })
  },
  activated() {
    // 第一次加载或者从直播间返回列表不刷新
    if (this.isInit) {
      return false
    }

    // 后台10分钟更新一次数据
    const currTime = dayjs().valueOf()
    if (currTime - this.$store.state.appLoadLiveTime > 10 * 60 * 1000) {
      // 从直播页或者主播收藏页返回时，不变刷新列表
      if (
        this.$store.state.previousRoute !== '/live' &&
        this.$store.state.previousRoute !== '/collectAnchor'
      ) {
        this.isInit = true
        this.page.pageNo = 1
        this.finished = false
        this.getDataList(null, true)
      }
    }
  },
  mounted() {},
  destroyed() {
    PubSub.unsubscribe('ON_SEARCHLIVE')
  },
  methods: {
    onRoute(path) {
      this.$router.push(path)
    },
    async getDataList(done, isRefresh) {
      const targetMenu = this.appFooter.find(one => one.expand === '/streaming')
      if (!targetMenu) {
        return this.$toast('获取分类信息失败')
      }
      const targetData = targetMenu.child.find(
        one => one.categoryId === this.categoryId
      )
      if (!targetData || !targetData.child || !targetData.child[0]) {
        return this.$toast('获取分类信息失败')
      }
      const params = {
        ...this.page,
        mediaType: 7,
        orderType: 'SORT_PUBLISH',
        categoryId: targetData.child[0].categoryId,
        ...this.searchData,
      }
      this.$store.state.appLoadLiveTime = dayjs().valueOf()
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
        let resultData = res.data.dataList.map(one => {
          one['liveImage'] =
            one.anchor.previewUrlThumbBig ||
            one.anchor.avatarUrl ||
            one.anchor.previewUrl ||
            one.anchor.previewUrlThumbSmall
          return one
        })
        if (this.bannerList.length) {
          resultData = this.insertAd2List(10, resultData)
        }
        if (isRefresh) {
          this.dataList = resultData
        } else {
          this.dataList = this.dataList.concat(resultData)
        }
        this.finished = this.page.pageNo * this.page.pageSize > res.data.total
      }
    },
    /**
     * 每间隔指定长度插入广告
     * @param {number} len
     * @param {array} data
     */
    insertAd2List(len, data) {
      const chunkList = _.chunk(data, len)
      let resultData = []
      chunkList.forEach(one => {
        const banner = _.sample(this.bannerList)
        one.push({ type: 'banner', data: banner })
        resultData = _.concat(resultData, one)
      })
      return resultData
    },
    onRefresh(done) {
      this.page.pageNo = 1
      this.getDataList(done, true)
    },
    onLoad(done) {
      this.page.pageNo++
      this.getDataList(done)
    },
    async handleConfirm(data) {
      const res = await anchorPurchase({
        merchantAcct: data.mediaType,
        mediaId: data.mediaId,
        type: 1,
      })
      if (res && res.code === 0) {
        // 扣除金币
        const userData = Object.assign({}, this.userInfo)
        userData.coinBalance = userData.coinBalance - data.goldPayUnit
        this.$store.commit('SET_USERINFO', userData)
        // 修改状态
        const targetIndex = _.findIndex(
          this.dataList,
          one => one.mediaId === data.mediaId
        )
        const targetData = this.dataList[targetIndex]
        targetData['preview'] = false
        this.$set(this.dataList, targetIndex, targetData)
        // 进入直播间
        this.$router.push({
          path: '/live',
          query: {
            actorId: data.mediaId,
          },
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.collect-anchor {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-radius: 20px;
  background: #109fff;
  color: #fff;
  margin: 0 16px 16px;
  > div:first-child {
  }
  > div:last-child {
    opacity: 0.6;
    display: inline-flex;
    align-items: center;
    img {
      width: 16px;
      margin-left: 6px;
    }
  }
}
.van-pull-refresh {
  padding-bottom: 64px;
}
.data-list {
  padding: 0 16px;
}
.data-row {
  display: flex;
  flex-flow: wrap;
  justify-content: space-between;
  .banner {
    width: 100%;
    margin-bottom: 12px;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    .banner-item {
      img {
        width: 100%;
      }
    }
    .banner-title {
      width: 100%;
      height: 21px;
      line-height: 18px;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
