<template>
  <div class="recommend-area">
    <div class="recommend-title">看了又看</div>
    <Loading v-if="isInit" height="200px" />
    <div v-else class="recommend-list">
      <div class="empty-box" v-if="!dataList.length">
        <van-empty
          :image="require('@/assets/images/emptyImage.png')"
          image-size="100"
          description="暂无内容"
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
            <BannerItem v-if="data.type === 'banner'" :bannerData="data.data" />
            <WorkItem
              v-else
              :itemInfo="data"
              :coverHeight="data.coverHeight"
              :isReplace="true"
            />
          </div>
        </div>
      </van-list>
    </div>
  </div>
</template>

<script>
import WorkItem from '@/components/WorkItem'
import Loading from '@/components/Loading'
import _ from 'lodash'
import BannerItem from '@/components/BannerItem'
import { listMediaByPageAndSortType } from '@/apis/comic'
import Masonry from 'masonry-layout'

export default {
  name: 'RecommendComponent',
  props: {
    mediaType: {
      type: Number,
      default: 1,
    },
    categoryId: {
      type: String,
      default: '',
    },
  },
  components: {
    Loading,
    WorkItem,
    BannerItem,
    Masonry,
  },
  computed: {
    dataDic() {
      return this.$store.state.dataDic
    },
    bannerList(){
        if(this.$store.state.banner && this.$store.state.banner['comics_list']){
            return this.$store.state.banner['comics_list']
        }else{
            return []
        }
    }
  },
  data() {
    return {
      isInit: true,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      finished: false,
      dataList: [],
      refreshing: false,
      loading: false,
    }
  },
  async created() {
    this.getDataList()
  },
  mounted() {},
  updated() {
    const LayoutDom = document.querySelector('.masonry-grid')
    if (LayoutDom) {
      new Masonry(LayoutDom, {
        itemSelector: '.grid-item',
        gutter: '.grid-gutter',
      })
    }
  },
  destroyed() {},
  methods: {
    async getDataList(done, isRefresh) {
      let params = {
        ...this.page,
        comicType: this.mediaType,
        orderType: 'SORT_PUBLISH',
        thirdCategoryId: this.categoryId,
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
      }
      this.loading = true
      const res = await listMediaByPageAndSortType(params).catch(() => {
        this.isInit = false
        done && done()
        this.loading = false
      })
      this.isInit = false
      done && done()
      this.loading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      if (res && res.code === 0) {
        let resultData = []
        if (this.bannerList.length) {
          resultData = this.insertAd2List(
            this.dataDic.inADNub || 10,
            res.data.dataList
          )
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
    onRefresh() {
      this.page.pageNo = 1
      this.getDataList(null, true)
    },
    onLoad(done) {
      this.page.pageNo++
      this.getDataList(done)
    },
  },
}
</script>

<style lang="less" scoped>
.recommend-area {
  background: #fff;
  min-height: 100vh;
}
.recommend-title {
  padding: 16px;
  font-size: 18px;
}
.masonry-grid {
  margin: 0 16px;
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
