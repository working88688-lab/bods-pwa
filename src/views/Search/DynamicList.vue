<template>
  <div>
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
        class="data-list"
        @load="onLoad"
      >
        <div class="data-row">
          <Dynamic
            v-for="(data, idx) in dataList"
            :key="idx"
            type="brokeNews"
            :dynamic="data"
            :showDivider="idx !== dataList.length - 1"
            :showFlow="false"
            :showContentBottom="false"
          />
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import { formatStrNum } from '@/utils/tools'
import { searchMedia } from '@/apis/media'
import Loading from '@/components/Loading'
import Dynamic from '@/components/Dynamic'

export default {
  name: 'DynamicList',
  components: {
    Loading,
    Dynamic,
  },
  props: {
    searchLabel: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      dataList: [],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      finished: false,
      refreshing: false,
      loading: false,
      isInit: true,
    }
  },
  computed: {
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    isApp() {
      return this.$store.state.isApp
    },
    device() {
      return this.$store.state.device
    },
  },
  mounted() {},
  destroyed() {},
  created() {
    this.getDataList(null, true)
  },
  methods: {
    async getDataList(done, isRefresh) {
      const params = {
        ...this.page,
        searchKeyword: this.searchLabel,
        mediaType: 3,
        orderType: 'SORT_VIEW',
      }
      this.loading = true
      const res = await searchMedia(params).catch(() => {
        this.isInit = false
      })
      done && done()
      this.isInit = false
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
  },
}
</script>

<style lang="less" scoped>
.van-pull-refresh {
  min-height: 50vh;
}
.data-list {
  width: 100%;
  padding: 8px 16px;
  .data-row {
  }
}
</style>
