<template>
  <div class="page-container flex-container">
    <Header :title="title" textColor="#222222" @onClickLeft="onBack" />
    <div class="page-content">
      <Loading v-if="isInit" />
      <template v-else>
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
          </van-list>
        </van-pull-refresh>
      </template>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { listMediaByPageAndSortType } from '@/apis/comic'
import { formatStrNum } from '@/utils/tools'
import _ from 'lodash'
import WorkItem from '@/components/WorkItem'
import BannerItem from '@/components/BannerItem'
import Masonry from 'masonry-layout'

export default {
  name: 'WorkList',
  components: {
    Header,
    Loading,
    WorkItem,
    BannerItem,
    Masonry,
  },
  data() {
    return {
      title: '',
      categoryId: '',
      mediaType: '',
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      isInit: true,
      finished: false,
      dataList: [],
      refreshing: false,
      loading: false,
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
    bannerList(){
        if(this.$store.state.banner && this.$store.state.banner['movie_list']){
            return this.$store.state.banner['movie_list']
        }else{
            return []
        }
    }
  },
  created() {
    this.init()
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
  methods: {
    init() {
      const { label, categoryId, mediaType } = this.$route.query
      if (!label || !categoryId || !mediaType) {
        return (this.isInit = true)
      }
      this.title = label
      this.categoryId = categoryId
      this.mediaType = mediaType
      this.isInit = true
      this.page.pageNo = 1
      this.dataList = []
      this.finished = false
      this.getDataList(null, true)
    },
    onBack() {
      this.$router.go(-1)
    },
    async getDataList(done, isRefresh) {
      let params
      if (this.categoryId === 'latest') {
        params = {
          ...this.page,
          comicType: this.mediaType,
          orderType: 'SORT_PUBLISH',
        }
      } else {
        params = {
          ...this.page,
          comicType: this.mediaType,
          orderType: 'SORT_PUBLISH',
          thirdCategoryId: this.categoryId,
          merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        }
      }
      this.loading = true
      const res = await listMediaByPageAndSortType(params)
      this.isInit = false
      this.loading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      done && done()
      if (res && res.code === 0) {
        let resultData = []
        if (this.bannerList.length) {
          resultData = this.insertAd2List(10, res.data.dataList)
        } else {
          resultData = res.data.dataList
        }
        resultData = resultData.map(one => {
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
    formatNum(num) {
      return formatStrNum(num)
    },
  },
}
</script>

<style lang="less" scoped>
.page-content {
  flex: 1;
  overflow: auto;
}
.data-list {
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
