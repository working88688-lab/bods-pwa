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
        <div class="masonry-grid">
          <div class="grid-gutter"></div>
          <div class="grid-item" v-for="(data, idx) in dataList" :key="idx">
            <WorkItem :itemInfo="data" :coverHeight="data.coverHeight" />
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
import MovieItem from '@/components/MovieItem'
import Masonry from 'masonry-layout'

export default {
  name: 'MovieList',
  components: {
    Loading,
    MovieItem,
    Masonry,
  },
  data() {
    return {
      isInit: true,
      finished: false,
      refreshing: false,
      loading: false,
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
  },
  created() {
    this.getDataList(null, true)
  },
  updated() {
    const LayoutDom = document.querySelector('.masonry-grid')
    if (LayoutDom) {
      new Masonry(LayoutDom, {
        itemSelector: '.grid-item',
        gutter: '.grid-gutter',
      })
    }
  },
  methods: {
    async getDataList(done, isRefresh) {
      let params = {
        ...this.page,
        searchType: 'USER_BUY_RECORD',
        mediaType: 1,
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
        let resultData = res.data.dataList
        resultData = resultData.map(one => {
          if (one.type !== 'banner') {
            if (one.video && one.video.videoCoverImg && one.video.coverHeight) {
              one['coverHeight'] =
                (one.video.coverHeight / one.video.coverWidth).toFixed(2) *
                  100 +
                '%'
            } else {
              one['coverHeight'] = '100%'
            }
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
.movie-list {
  padding: 0 16px;
  overflow: hidden;
}
.masonry-grid {
  .grid-gutter {
    width: 3%;
  }
  .grid-item {
    width: 48.5%;
  }
  .banner {
    margin-bottom: 12px;
  }
}
</style>
