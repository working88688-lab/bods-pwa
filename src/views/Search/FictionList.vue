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
        <div class="fiction-grid">
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
import { searchComic } from '@/apis/comic'
import Loading from '@/components/Loading'
import WorkItem from './components/WorkItem'
import Masonry from 'masonry-layout'

export default {
  name: 'FictionList',
  components: {
    Loading,
    WorkItem,
    Masonry,
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
  updated() {
    const LayoutDom = document.querySelector('.fiction-grid')
    if (LayoutDom) {
      new Masonry(LayoutDom, {
        itemSelector: '.grid-item',
        gutter: '.grid-gutter',
      })
    }
  },
  mounted() {},
  destroyed() {},
  created() {
    this.getDataList(null, true)
  },
  methods: {
    async getDataList(done, isRefresh) {
      const params = {
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        ...this.page,
        searchKeyword: this.searchLabel,
        mediaType: 10,
      }
      this.loading = true
      const res = await searchComic(params).catch(() => {
        this.isInit = false
      })
      done && done()
      this.isInit = false
      this.loading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      if (res && res.code === 0) {
        let dataList = res.data.dataList.map(one => {
          one['comicVo'] = JSON.parse(JSON.stringify(one))
          return one
        })
        dataList = dataList.map(one => {
          if (one.type !== 'banner') {
            if (
              one.comicVo && one.comicVo.comicVo &&
              one.comicVo.comicVo.comicCover &&
              one.comicVo.comicVo.coverHeight
            ) {
              one['coverHeight'] =
                (one.comicVo.comicVo.coverHeight / one.comicVo.comicVo.coverWidth).toFixed(2) *
                  100 +
                '%'
            } else if (
              one.chapterVo &&
              chapterVo.chapterCover &&
              one.chapterVo.coverHeight
            ) {
              one['coverHeight'] =
                (one.chapterVo.coverHeight / one.chapterVo.coverHeight).toFixed(
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
          this.dataList = dataList
        } else {
          this.dataList = this.dataList.concat(dataList)
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
}
.fiction-grid {
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
