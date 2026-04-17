<template>
  <div class="data-list">
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
        <div class="data-row">
          <div class="masonry-grid">
            <div class="grid-gutter"></div>
            <div class="grid-item" v-for="(data, idx) in dataList" :key="idx">
              <BannerItem
                v-if="data.type === 'banner'"
                :bannerData="data.data"
              />
              <WorkItem
                v-else
                :itemInfo="data"
                :coverHeight="data.coverHeight"
              />
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import { formatStrNum } from '@/utils/tools'
import { listMediaBySearchType } from '@/apis/comic'
import _ from 'lodash'
import Loading from '@/components/Loading'
import WorkItem from '@/components/WorkItem'
import Masonry from 'masonry-layout'

export default {
  name: 'CartoonList',
  components: {
    Loading,
    WorkItem,
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
        searchType: 'USER_VIEW_RECORD',
        comicType: 9,
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
        let resultList = res.data.dataList || []
        resultList = resultList.map(one => {
          if (one.type !== 'banner') {
            if (
              one.comicVo &&
              one.comicVo.comicCover &&
              one.comicVo.coverHeight
            ) {
              one['coverHeight'] =
                (one.comicVo.coverHeight / one.comicVo.coverWidth).toFixed(2) *
                  100 +
                '%'
            } else if (
              one.comicVo &&
              one.comicVo.chapterCover &&
              one.comicVo.chapterCoverHeight
            ) {
              one['coverHeight'] =
                (
                  one.comicVo.chapterCoverHeight / one.comicVo.chapterCoverWidth
                ).toFixed(2) *
                  100 +
                '%'
            } else if (
              one.chapterVo &&
              one.chapterVo.chapterCover &&
              one.chapterVo.coverHeight
            ) {
              one['coverHeight'] =
                (one.chapterVo.coverHeight / one.chapterVo.coverWidth).toFixed(
                  2
                ) *
                  100 +
                '%'
            } else {
              one['coverHeight'] = '100%'
            }
          }
          return one
        })
        if (isRefresh) {
          this.dataList = resultList
        } else {
          this.dataList = this.dataList.concat(resultList)
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
  padding: 0 16px 16px;
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
