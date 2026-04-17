<template>
  <div class="page-container flex-container page">
    <Header :title="title" textColor="#000" @onClickLeft="onBack" />
    <div class="filter">
      <div>
        <span>{{ filter1.title }}:</span>
        <span v-for="item in filter1.list" :key="item.value" :class="{ active: item.value === searchType }"
          @click="onFilter(filter1.key, item.value)">
          <span>{{ item.label }}</span>
        </span>
      </div>
      <div>
        <span>{{ filter2.title }}:</span>
        <span v-for="item in filter2.list" :key="item.value" :class="{ active: item.value === payType }"
          @click="onFilter(filter2.key, item.value)">
          <span>{{ item.label }}</span>
        </span>
      </div>
      <div>
        <span>{{ filter3.title }}:</span>
        <span v-for="item in filter3.list" :key="item.value" :class="{ active: item.value === orderType }"
          @click="onFilter(filter3.key, item.value)">
          <span>{{ item.label }}</span>
        </span>
        <span class="reset" @click="reset">重置</span>
        <img class="icon" :src="type === 1 ? one : two" @click="layoutchange" />
      </div>
    </div>
    <div class="page-content">
      <Loading v-if="isInit" />
      <template v-else>
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <div class="empty-box" v-if="!dataList.length">
            <van-empty :image="require('@/assets/images/emptyImage.png')" image-size="120" description="暂无数据哦~" />
          </div>
          <van-list v-else v-model:loading="loading" :finished="finished" finished-text="没有更多了" class="movie-list"
            @load="onLoad">
            <div class="masonry-grid">
              <div class="gutter-size"></div>
              <div class="grid-item" v-for="(data, idx) in dataList" :key="data.mediaId" :style="gridItemStyle">
                <div class="data-item banner" v-if="data.type === 'banner'" :key="'banner' + idx">
                  <Advertise :banner="data.data" />
                  <div class="banner-title">{{ data.data.bannerName }}</div>
                </div>
                <MovieItem v-else :key="idx" :videoInfo="data" :coverHeight="data.coverHeight" />
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
import { listMediaBySearchType } from '@/apis/media'
import { formatStrNum } from '@/utils/tools'
import _ from 'lodash'
import MovieItem from '@/components/MovieItem'
import Advertise from '@/components/Advertise'
import Masonry from 'masonry-layout'
import { useInsert, useThirdNavigation } from '@/hooks'
import one from '@/assets/images/dashicons-screenoptions-white.png'
import two from '@/assets/images/material-symbols-splitscreen-white.png'

export default {
  name: 'History',
  components: {
    Header,
    Loading,
    MovieItem,
    Advertise,
  },
  data() {
    return {
      title: '',
      queryType: '',
      payType: '',
      categoryId: '',
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
      layout: null,
      searchType: 0,
      filter1: {
        title: '筛选',
        key: 'searchType',
        list: [
          { value: 0, label: '全部' },
          { value: 'RECOMMEND', label: '推荐' },
        ],
      },
      payType: null,
      filter2: {
        title: '付费',
        key: 'payType',
        list: [
          { value: null, label: '全部' },
          { value: 1, label: '限免' },
          { value: 2, label: '金币' },
          { value: 4, label: 'VIP' },
        ],
      },
      orderType: 'SORT_PUBLISH_WEIGHT',
      filter3: {
        title: '排序',
        key: 'orderType',
        list: [
          { value: 'SORT_PUBLISH_WEIGHT', label: '最新' },
          { value: 'SORT_VIEW', label: '观看数' },
          { value: 'SORT_FAVOR', label: '点赞数' },
        ],
      },
      banner_index: 0,
      type: 1,
      one,
      two,
      gridItemStyle: {}
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    isApp() {
      return this.$store.state.isApp
    },
    dataDic() {
      return this.$store.state.dataDic
    },
    dataDic() {
      return this.$store.state.dataDic
    },
    bannerList() {
      if (this.$store.state.banner && this.$store.state.banner['movie_list']) {
        return this.$store.state.banner['movie_list']
      } else {
        return []
      }
    },
  },
  created() {
    this.init()
  },
  activated() {
    if (!this.$route.query.label) {
      this.$router.go(-1)
    } else {
      if (this.$route.query.categoryId !== this.categoryId) {
        this.init()
        this.type = 1
      }
    }
    this.$nextTick(() => {
      document.querySelector('.page-content').scrollTop = this.scrollTop
    })
  },
  beforeRouteLeave(to, from, next) {
    this.scrollTop = document.querySelector('.page-content').scrollTop
    next()
  },
  updated() {
    const LayoutDom = document.querySelector('.masonry-grid')
    if (LayoutDom) {
      new Masonry(LayoutDom, {
        itemSelector: '.grid-item',
        gutter: '.gutter-size',
      })
    }
  },
  methods: {
    layoutchange() {
      if (this.type === 1) {
        this.type = 2
        this.gridItemStyle = { width: '100%' }
      } else {
        this.type = 1
        this.gridItemStyle = {}
      }
    },
    reset() {
      this.searchType = 0
      this.payType = null
      this.orderType = 'SORT_PUBLISH_WEIGHT'
      this.page.pageNo = 1
      this.useData(true)
    },
    onFilter(key, e) {
      if (this[key] !== e) {
        this[key] = e
        this.page.pageNo = 1
        this.useData(true)
      }
    },
    async init() {
      const { label, queryType, payType, categoryId, layout } = this.$route.query
      this.title = label
      this.categoryId = categoryId
      this.isInit = true
      this.useData(true)
    },
    onBack() {
      this.$router.go(-1)
    },
    async useData(e = null) {
      try {
        const params = {
          ...this.page,
          orderType: this.orderType,
          mediaType: 1,
          categoryId: this.categoryId,
          ...(this.searchType ? { searchType: this.searchType } : {}),
          ...(this.payType ? { payType: this.payType } : {}),
        }
        const response = await listMediaBySearchType(params)

        if (response.code === 0 && response.data.dataList) {
          let result = response.data.dataList.map(item => {
            if (item.video && item.video.videoCoverImg && item.video.coverHeight) {
              item['coverHeight'] = (item.video.coverHeight / item.video.coverWidth).toFixed(2) * 100 + '%'
            } else if (item.mediaType === 2 || item.mediaType === 21) {
              item['coverHeight'] = '142%'
            } else if (item.mediaType === 1 || item.mediaType === 22) {
              item['coverHeight'] = '67%'
            } else {
              item['coverHeight'] = '100%'
            }
            return item
          })
          if (this.bannerList.length) {
            result = useInsert(this.dataDic.inADNub || 10, result, this.bannerList[this.banner_index])
            if (this.banner_index < this.bannerList.length - 1) {
              this.banner_index++
            } else {
              this.banner_index = 0
            }
          }
          if (this.refreshing || e) {
            this.dataList = result
          } else {
            this.dataList = this.dataList.concat(result)
          }
          this.finished = this.page.pageNo * this.pageSize >= response.data.total
        }
      } catch (error) {
        throw error
      } finally {
        this.isInit = false
        this.refreshing = false
        this.loading = false
      }
    },
    onLoad() {
      this.page.pageNo++
      this.useData()
    },
    onRefresh() {
      this.page.pageNo = 1
      this.finished = false
      this.useData()
    },
    formatNum(num) {
      return formatStrNum(num)
    },
  },
}
</script>

<style lang="less" scoped>
.filter {
  background: rgb(166, 225, 239);
  border-radius: 6px;
  margin-bottom: 10px;
  padding: 10px 6px;
  position: sticky;
  margin: 0 12px 12px;
  top: 0;
  z-index: 10;

  &>div:not(:first-of-type) {
    margin-top: 10px;
  }

  &>div {
    display: flex;
    align-items: center;

    &>span {
      &:first-of-type {
        margin-right: 10px;
      }

      &:not(:first-of-type) {
        margin-right: 16px;

        &.active {
          color: var(--theme-color);
        }

        &.reset {
          margin-left: auto;
          margin-right: 0;
          color: #fff;
          background: var(--theme-color);
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
        }
      }
    }

    .icon {
      width: 22px;
      height: 22px;
      background: var(--theme-color);
      border-radius: 4px;
      margin-left: 8px;
      padding: 0 8px;
      box-sizing: content-box;
    }
  }
}

.page-content {
  flex: 1;
  overflow: auto;
  padding: 0 12px 12px;
}

.masonry-grid {
  .gutter-size {
    width: 12px;
  }

  .grid-item {
    width: calc((100% - 12px) / 2);
  }

  .banner {
    margin-bottom: 12px;
    position: relative;
    overflow: hidden;
    background: #fff;
    border-radius: 6px;

    .banner-item {
      height: 96px;
      border-radius: 8px;
      overflow: hidden;
      position: relative;

      .banner-title {
        color: #000;
      }

      img {
        width: 100%;
        height: 100%;
      }
    }

    .banner-title {
      color: #000;
      width: 100%;
      font-size: 12px;
      margin: 6px 0;
      padding: 0 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

  }

  .large-banner {
    width: 100%;
    margin-right: 0;

    .banner-item {
      height: 190px;
    }
  }
}
</style>
