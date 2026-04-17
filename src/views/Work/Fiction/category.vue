<template>
  <div class="recommend-page" ref="recommendPageRef">
    <Loading v-if="isInit" height="200px" />
    <template v-else>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="recom-list" v-if="isRecom">
          <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" class="data-list"
            @load="onLoad">
            <div class="recom-item" v-for="(recom, idx) in recomList" :key="idx">
              <div class="recom-title">{{ recom.categoryName }}</div>
              <Loading v-if="recom.isLoading" height="200px" />
              <div v-else class="data-list">
                <WorkItem v-for="(data, m) in recom.comicList" :key="m" :itemInfo="data" coverHeight="180px" />
              </div>
              <div class="btn-box">
                <van-button round class="btn-change" @click="onChange(recom, idx)">换一换</van-button>
                <van-button round type="primary" class="btn-more" @click="onMore(recom)">查看更多</van-button>
              </div>
            </div>
          </van-list>
        </div>
        <template v-else>
          <div class="empty-box" v-if="!dataList.length">
            <van-empty :image="require('@/assets/images/emptyImage.png')" image-size="100" description="暂无内容" />
          </div>
          <van-list v-else v-model:loading="loading" :finished="finished" finished-text="没有更多了" class="data-list"
            @load="onLoad">
            <div class="masonry-grid">
              <div class="grid-gutter"></div>
              <div class="grid-item" v-for="(data, idx) in dataList" :key="idx">
                <BannerItem v-if="data.type === 'banner'" :bannerData="data.data" />
                <WorkItem v-else :itemInfo="data" />
              </div>
            </div>
          </van-list>
        </template>
      </van-pull-refresh>
    </template>
  </div>
</template>

<script>
import {
  listMediaByPageAndSortType,
  listAllBySecondCategoryIdNew,
} from '@/apis/comic'
import WorkItem from '@/components/WorkItem'
import Loading from '@/components/Loading'
import _ from 'lodash'
import BannerItem from '@/components/BannerItem'
import Masonry from 'masonry-layout'

export default {
  name: 'FictionCategory',
  components: {
    WorkItem,
    Loading,
    BannerItem,
    Masonry,
  },
  data() {
    return {
      isInit: true,
      categoryId: '',
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      finished: false,
      dataList: [],
      refreshing: false,
      loading: false,
      scrollTop: 0,
      isRecom: false,
      recomList: [],
      searchType: '',
      chapterOver: '',
    }
  },
  computed: {
    appFooter() {
      return this.$store.state.appFooter
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    isApp() {
      return this.$store.state.isApp
    },
    device() {
      return this.$store.state.device
    },
    dataDic() {
      return this.$store.state.dataDic
    },
    bannerList() {
      if (this.$store.state.banner && this.$store.state.banner['novel_list']) {
        return this.$store.state.banner['novel_list']
      } else {
        return []
      }
    },
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
    // this.init()
    this.$nextTick(() => {
      document.documentElement.scrollTop = this.scrollTop
    })
  },
  beforeRouteLeave(to, from, next) {
    this.scrollTop = document.documentElement.scrollTop
    next()
  },
  mounted() { },
  methods: {
    async init() {
      const { categoryId, isRecom, searchType, chapterOver } = this.$route.query
      this.categoryId = categoryId
      // 判断是否是推荐页
      if (isRecom === 'true') {
        this.searchType = ''
        this.chapterOver = ''
        this.isRecom = true
        this.getRecomList()
      } else {
        this.searchType = searchType
        this.chapterOver = chapterOver * 1
        this.isRecom = false

        // 查询媒体信息
        this.getDataList(null, true)
      }
    },
    async getRecomList() {
      this.recomList = []
      // 获取最近更新的作品
      const latestRes = await listMediaByPageAndSortType({
        pageNo: 1,
        pageSize: 6,
        comicType: 10,
        orderType: 'SORT_PUBLISH',
      }).catch(() => {
        this.isInit = false
      })
      if (latestRes && latestRes.code === 0) {
        const item = {
          mediaType: 10,
          categoryName: '最近更新',
          comicList: latestRes.data.dataList,
          categoryId: 'latest',
          isLoading: false,
          totalPage: Math.ceil(latestRes.data.total / 6),
        }
        this.recomList.push(item)
      }
      // 获取推荐其他作品
      const res = await listAllBySecondCategoryIdNew({
        comicType: 10,
        secondCategoryId: this.categoryId,
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        ...this.page

      }).catch(() => {
        this.isInit = false
      })
      this.isInit = false
      if (this.refreshing) {
        this.refreshing = false
      }
      if (res && res.code === 0) {
        const resultData = res.data.dataList
          .filter(one => one.comicList.length)
          .map(one => {
            one['totalPage'] = 0
            one['isLoading'] = false
            return one
          })
        let list = resultData
        if (this.refreshing) {
          this.refreshing = false
          this.recomList = list
        } else {
          this.recomList = this.recomList.concat(list)
        }
        this.finished = this.page.pageSize > res.data.dataList.length
      }
    },
    async onChange(item, idx) {
      if (item.categoryId === 'latest') {
        let params = {
          pageSize: 6,
          comicType: 10,
          orderType: 'SORT_PUBLISH',
        }
        if (item.totalPage) {
          params['pageNo'] = _.random(2, item.totalPage)
        } else {
          params['pageNo'] = 2
        }
        this.recomList[idx].isLoading = true
        const res = await listMediaByPageAndSortType(params).catch(() => {
          this.recomList[idx].isLoading = false
        })
        this.recomList[idx].isLoading = false
        if (res && res.code === 0) {
          this.recomList[idx].comicList = res.data.dataList
          this.recomList[idx]['totalPage'] = Math.ceil(res.data.total / 6)
        }
      } else {
        let params = {
          pageSize: 6,
          comicType: 10,
          orderType: 'SORT_PUBLISH',
          thirdCategoryId: item.categoryId,
          merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        }
        if (item.totalPage) {
          params['pageNo'] = _.random(2, item.totalPage)
        } else {
          params['pageNo'] = 2
        }
        this.recomList[idx].isLoading = true
        const res = await listMediaByPageAndSortType(params).catch(() => {
          this.recomList[idx].isLoading = false
        })
        this.recomList[idx].isLoading = false
        if (res && res.code === 0) {
          this.recomList[idx].comicList = res.data.dataList
          this.recomList[idx]['totalPage'] = Math.ceil(res.data.total / 6)
        }
      }
    },
    onMore(item) {
      this.$router.push({
        path: '/workList',
        query: {
          label: item.categoryName,
          categoryId: item.categoryId,
          mediaType: item.mediaType,
        },
      })
    },
    async getDataList(done, isRefresh) {
      const params = {
        ...this.page,
        comicType: 10,
        orderType: this.searchType,
        chapterOver: this.chapterOver,
        thirdCategoryId: this.categoryId,
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
      }
      this.loading = true
      const res = await listMediaByPageAndSortType(params)
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
      if (this.isRecom) {
        this.getRecomList()
      } else {
        this.page.pageNo = 1
        this.getDataList(null, true)
      }
    },
    onLoad(done) {
      this.page.pageNo++
      if (this.isRecom) {
        this.getRecomList(done)
      } else {
        this.getDataList(done)
      }
    },
  },
}
</script>

<style lang="less" scoped>
.recommend-page {
  padding-bottom: 55px;
}

.van-pull-refresh {
  min-height: 50vh;
}

.recom-list {
  padding: 16px 16px 0;

  .recom-item {
    margin-bottom: 24px;

    .recom-title {
      padding: 0 0 12px;
      font-size: 18px;
      font-weight: bold;
    }

    .data-list {
      display: flex;
      flex-wrap: wrap;

      >div {
        width: calc((100% - 16px) / 2);
        margin-right: 16px;
      }

      >div:nth-child(2n) {
        margin-right: 0;
      }
    }

    .btn-box {
      margin-top: 16px;
      text-align: center;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;

      .van-button {
        min-width: 142px;
        height: 32px !important;
      }

      .btn-change {
        background: #fff !important;
        color: #109fff !important;
        border: none;
        margin-right: 16px;
      }
    }
  }
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
