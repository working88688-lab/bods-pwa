<template>
  <div>
    <div class="sticky-top" v-if="!isRecom" v-sticky="{ zIndex: 99, stickyTop: -1, disabled: false }" @touchstart.stop
      @touchmove.stop @touchend.stop>
      <van-tabs v-if="child.length > 1" v-model="categoryId" :ellipsis="false" :swipeable="false"
        @change="onChangeSubTabs">
        <van-tab v-for="(sub, idx) in child" :key="idx" :title="sub.label" :name="sub.categoryId"></van-tab>
      </van-tabs>
      <FilterComponent :showStatus="categoryId !== 'latest'" :showPayType="categoryId === 'latest'"
        :showSort="categoryId !== 'latest'" @onFilter="handleFilter" @onChangeListLayout="handleChangeListLayout" />
    </div>
    <Loading v-if="isInit" height="200px" />
    <template v-else>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="recom-list" v-if="isRecom">
          <div class="recom-item" :id="'recom-item-' + idx" v-for="(recom, idx) in recomList" :key="idx">
            <Banner class="xxx" v-if="recom.type === 'banner'" :key="'banner' + idx" location="Topics" />
            <template v-else>
              <div class="recom-title">{{ recom.categoryName }}</div>
              <Loading v-if="recom.isLoading" height="200px" />
              <div v-else class="data-list">
                <WorkItem v-for="(data, m) in recom.comicList" :key="m" :itemInfo="data"
                  :coverHeight="data.coverHeight" />
              </div>
              <div class="btn-box">
                <van-button round class="btn-change" @click="onChange(recom, idx)">换一换</van-button>
                <van-button round type="primary" class="btn-more" @click="onMore(recom)">查看更多</van-button>
              </div>
            </template>
          </div>
        </div>
        <template v-else>
          <div class="empty-box" v-if="!dataList.length">
            <van-empty :image="require('@/assets/images/emptyImage.png')" image-size="100" description="暂无内容" />
          </div>
          <van-list v-else v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
            <div :class="'masonry-grid masonry-grid-' + secondCategoryId">
              <div class="grid-gutter"></div>
              <div :style="{ width: gridItemStyle }" v-for="(data, idx) in dataList" :key="idx">
                <BannerItem v-if="data.type === 'banner'" :bannerData="data.data" />
                <template v-else>
                  <CartoonChapter v-if="isJalan" :itemInfo="data" :coverHeight="data.coverHeight" />
                  <WorkItem v-else :itemInfo="data" :coverHeight="data.coverHeight" />
                </template>
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
  chapterPage,
} from '@/apis/comic'
import WorkItem from '@/components/WorkItem'
import CartoonChapter from '@/components/CartoonChapter'
import Loading from '@/components/Loading'
import _ from 'lodash'
import BannerItem from '@/components/BannerItem'
import Banner from '@/components/Banner'
import Masonry from 'masonry-layout'
import FilterComponent from '../components/FilterComponent'
import { ListLayoutTagEnum } from '@/enums'

export default {
  name: 'ComicsCategory',
  components: {
    FilterComponent,
    WorkItem,
    CartoonChapter,
    Loading,
    BannerItem,
    Masonry,
    Banner,
  },
  props: {
    mediaType: {
      type: Number,
      default: 8,
    },
    secondCategoryId: {
      type: String,
      default: '',
    },
    isRecom: {
      type: Boolean,
      default: false,
    },
    isJalan: {
      type: Boolean,
      default: false,
    },
    child: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {
      categoryId: '',
      searchType: 'SORT_PUBLISH',
      chapterOver: null,
      payType: null,
      isInit: true,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      finished: false,
      dataList: [],
      refreshing: false,
      loading: false,
      scrollTop: 0,
      recomList: [],
      gridItemStyle: '48.5%'
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
      if (
        this.$store.state.banner &&
        this.$store.state.banner[this.isRecom ? 'Topics' : 'comics_list']
      ) {
        return this.$store.state.banner[this.isRecom ? 'Topics' : 'comics_list']
      } else {
        return []
      }
    },
  },
  async created() {
    if (this.child.length) {
      this.categoryId = this.child[0].categoryId
    }
    // 判断是否是推荐页
    if (this.isRecom) {
      this.getRecomList()
    } else {
      // 查询媒体信息
      this.getDataList(null, true)
    }
  },
  updated() {
    const LayoutDom = document.querySelector(
      '.masonry-grid-' + this.secondCategoryId
    )
    if (LayoutDom) {
      new Masonry(LayoutDom, {
        itemSelector: '.grid-item',
        gutter: '.grid-gutter',
      })
    }
  },
  activated() {
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
    onChangeSubTabs() {
      this.isInit = true
      this.page.pageNo = 1
      this.dataList = []
      this.getDataList(null, true)
    },
    handleFilter({ orderType, chapterOver, payType }) {
      this.searchType = orderType
      this.chapterOver = chapterOver
      this.payType = payType
      this.onChangeSubTabs()
    },
    handleChangeListLayout(e) {
      if (e == ListLayoutTagEnum.row) {
        this.gridItemStyle = '97%'
      } else {
        this.gridItemStyle = '48.5%'
      }
    },
    async getRecomList() {
      this.recomList = []
      // 获取推荐其他作品
      const res = await listAllBySecondCategoryIdNew({
        comicType: this.mediaType,
        secondCategoryId: this.secondCategoryId,
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        ...this.page
      }).catch(() => {
        this.isInit = false
      })
      this.isInit = false

      if (res && res.code === 0) {
        const resultData = res.data.dataList.map(one => {
          one['totalPage'] = 0
          one['isLoading'] = false
          one.comicList &&
            one.comicList.map((two, m) => {
              if (
                two.comicVo &&
                two.comicVo.chapterCover &&
                two.comicVo.chapterCoverHeight
              ) {
                two['coverHeight'] =
                  (
                    two.comicVo.chapterCoverHeight /
                    two.comicVo.chapterCoverWidth
                  ).toFixed(2) *
                  100 +
                  '%'
              } else if (
                two.chapterVo &&
                one.chapterVo.coverWidth &&
                two.chapterVo.coverHeight
              ) {
                two['coverHeight'] =
                  (
                    two.chapterVo.coverHeight / two.chapterVo.coverWidth
                  ).toFixed(2) *
                  100 +
                  '%'
              } else {
                two['coverHeight'] = '100%'
              }
              return two
            })
          return one
        })
        let list = []
        if (this.bannerList.length) {
          list = this.insertAd2List(
            this.dataDic.insert_ad || 1,
            resultData
          )
        } else {
          list = resultData
        }
        if (this.refreshing) {
          this.refreshing = false
          this.recomList = list
        } else {
          this.recomList = this.recomList.concat(list)
        }
      }
    },
    async onChange(item, idx) {
      let params = {
        pageSize: 6,
        comicType: this.mediaType,
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
        this.recomList[idx].comicList = res.data.dataList.map(one => {
          if (
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
            one.chapterVo.coverWidth &&
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
          return one
        })
        this.recomList[idx]['totalPage'] = Math.ceil(res.data.total / 6)
      }
      // 滚动到渲染视图位置
      this.$nextTick(() => {
        const targetDom = document.getElementById('recom-item-' + idx)
        document.documentElement.scrollTop = targetDom.offsetTop
      })
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
      let params, res
      if (this.isJalan) {
        params = {
          ...this.page,
          comicType: this.mediaType,
        }
        res = await chapterPage(params)
      } else {
        if (this.categoryId === 'latest') {
          params = {
            ...this.page,
            comicType: this.mediaType,
            orderType: 'SORT_PUBLISH',
            merchantAcct: process.env.VUE_APP_MERCHANTACCT,
          }
        } else {
          params = {
            ...this.page,
            comicType: this.mediaType,
            thirdCategoryId: this.categoryId,
            merchantAcct: process.env.VUE_APP_MERCHANTACCT,
          }
          if (this.searchType) {
            params['orderType'] = this.searchType
          }
        }
        if (this.chapterOver) {
          if (this.chapterOver === 'recommend') {
            params['recommend'] = 1
          } else {
            params['chapterOver'] = this.chapterOver
          }
        }
        if (this.payType) {
          params['payType'] = this.payType
        }
        this.loading = true
        res = await listMediaByPageAndSortType(params)
      }
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
              one.chapterVo.coverWidth &&
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
      if (this.isRecom) {
        this.page.pageNo = 1
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
.sticky-top {
  background: #f9f4f7;
  padding: 12px 0;
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
  margin: 0 12px;

  .grid-gutter {
    width: 3%;
  }

  // .grid-item {
  //   width: 48.5%;
  // }

  .banner {
    margin-bottom: 12px;
  }
}
</style>
