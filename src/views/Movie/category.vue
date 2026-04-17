<template>
  <div>
    <div
      class="sticky-top"
      v-sticky="{ zIndex: 99, stickyTop: -1, disabled: false }"
      @touchstart.stop
      @touchmove.stop
      @touchend.stop
    >
      <van-tabs
        v-if="child.length > 1"
        v-model="categoryId"
        :ellipsis="false"
        :swipeable="false"
        @change="onChangeSubTabs"
      >
        <van-tab
          v-for="(sub, idx) in child"
          :key="idx"
          :title="sub.label"
          :name="sub.categoryId"
        >
          <template #title>
            <div class="thrid">
              <img v-lazy="imageBase + sub.categoryCoverImg" alt="" />
              <div>{{ sub.thirdCategoryName }}</div>
            </div>
          </template>
        </van-tab>
      </van-tabs>
      <FilterComponent
        :showStatus="categoryId !== 'latest'"
        :showPayType="categoryId === 'latest'"
        :showSort="categoryId !== 'latest'"
        @onFilter="handleFilter"
      />
    </div>
    <Loading v-if="isInit" height="200px" />
    <template v-else>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
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
          @load="onLoad"
        >
          <div :class="'masonry-grid masonry-grid-' + secondCategoryId">
            <div class="grid-gutter"></div>
            <div class="grid-item" v-for="(data, idx) in dataList" :key="idx">
              <BannerItem
                v-if="data.type === 'banner'"
                :bannerData="data.data"
              />
              <MovieItem
                v-else
                :videoInfo="data"
                :coverHeight="data.coverHeight"
              />
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </template>
  </div>
</template>

<script>
import { listMediaBySearchType } from '@/apis/media'
import MovieItem from '@/components/MovieItem'
import Loading from '@/components/Loading'
import _ from 'lodash'
import BannerItem from '@/components/BannerItem'
import Masonry from 'masonry-layout'
import FilterComponent from './components/FilterComponent'
import { useThirdNavigation } from '@/hooks'

export default {
  name: 'ComicsCategory',
  components: {
    FilterComponent,
    MovieItem,
    Loading,
    BannerItem,
    Masonry,
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
      if (this.$store.state.banner && this.$store.state.banner['video_list']) {
        return this.$store.state.banner['video_list']
      } else {
        return []
      }
    },
    thrid() {
      console.log(useThirdNavigation(this.secondCategoryId))

      return useThirdNavigation(this.secondCategoryId)
    },
  },
  async created() {
    console.log(this.child);
    
    if (this.child.length) {
      this.categoryId = this.child[0].categoryId
    }
    // 查询媒体信息
    this.getDataList(null, true)
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
  mounted() {},
  methods: {
    onChangeSubTabs() {
      this.isInit = true
      this.page.pageNo = 1
      this.dataList = []
      this.getDataList(null, true)
    },
    handleFilter({ orderType, payType, recommend }) {
      this.searchType = orderType
      if (recommend === 'recommend') {
        this.searchType = 'RECOMMEND'
      }
      this.payType = payType
      this.onChangeSubTabs()
    },
    async getDataList(done, isRefresh) {
      let params
      if (this.categoryId === 'latest') {
        params = {
          ...this.page,
          mediaType: this.mediaType,
          orderType: 'SORT_PUBLISH',
          merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        }
      } else {
        params = {
          ...this.page,
          mediaType: this.mediaType,
          categoryId: this.categoryId,
          merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        }
        if (this.searchType) {
          params['orderType'] = this.searchType
        }
      }
      if (this.payType) {
        params['payType'] = this.payType
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
            if (one.video && one.video.videoCoverImg && one.video.coverHeight) {
              one['coverHeight'] =
                (one.video.coverHeight / one.video.coverWidth).toFixed(2) *
                  100 +
                '%'
            } else {
              one['coverHeight'] = '55%'
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
::v-deep .van-tabs {
  .van-tabs__wrap {
    height: fit-content;
    .van-tabs__nav {
      width: 100%;
      overflow: hidden;
      flex-wrap: wrap;
      .van-tab {
        width: calc((100% - 15px) / 4);
        .van-tab__text {
          .thrid {
          }
        }
      }
    }
  }
}
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

      > div {
        width: calc((100% - 16px) / 2);
        margin-right: 16px;
      }

      > div:nth-child(2n) {
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

  .grid-item {
    width: 48.5%;
  }

  .banner {
    margin-bottom: 12px;
  }
}
</style>
