<template>
  <div class="movie-list">
    <Loading v-if="isInit" />
    <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh">
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
        @load="onLoad"
      >
        <div class="movie-row">
          <div>
            <Dynamic
              v-for="(dynamic, idx) in dataList"
              :key="idx"
              type="brokeNews"
              :dynamic="dynamic"
              :showDivider="idx !== dataList.length - 1"
              :showFlow="
                !userInfo || dynamic.userInfoPo.userId !== userInfo.userId
              "
              :showReward="
                !userInfo || dynamic.userInfoPo.userId !== userInfo.userId
              "
              @changeData="handleChangeData($event, idx)"
            />
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import { formatStrNum } from '@/utils/tools'
import { listMediaBySearchType } from '@/apis/media'
import _ from 'lodash'
import Loading from '@/components/Loading'
import Dynamic from '@/components/Dynamic'

export default {
  name: 'SquareList',
  components: {
    Loading,
    Dynamic,
  },
  data() {
    return {
      isInit: true,
      refreshing: false,
      loading: false,
      finished: false,
      dataList: [],
      page: {
        pageNo: 1,
        pageSize: 10,
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
  },
  created() {
    this.getDataList(null, true)
  },
  methods: {
    async getDataList(done, isRefresh) {
      let params = {
        ...this.page,
        searchType: 'USER_VIEW_RECORD',
        mediaType: 3,
      }
      this.loading = true
      const res = await listMediaBySearchType(params)
      this.isInit = false
      done && done()
      this.loading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      if (res && res.code === 0) {
        const resultData = res.data.dataList.map(one => {
          if (one.article.picUrl) {
            one.article.picUrl = JSON.parse(one.article.picUrl)
          }
          if (one.article.videoUrl) {
            one.article.videoUrl = JSON.parse(one.article.videoUrl)
          }
          return one
        })
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
    handleChangeData({ data, action }, idx) {
      if (action === 'like' || action === 'buy') {
        this.$set(this.dataList, idx, data)
      } else if (action === 'follow') {
        this.dataList.forEach((one, i) => {
          if (data.userInfoPo.userId === one.userInfoPo.userId) {
            let targetData = Object.assign({}, one)
            targetData.hasFollow = data.hasFollow
            this.$set(this.dataList, i, targetData)
          }
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.van-pull-refresh {
  min-height: 50vh;
}
.movie-list {
  padding: 0 16px;
  overflow: hidden;
}
</style>
