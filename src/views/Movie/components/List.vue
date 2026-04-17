<template>
  <div class="list">
    <div v-if="!expand" class="thrid">
      <div v-for="item in child" :key="item.categoryId" @click="handleclick(item)">
        <img v-lazy="imageBase + item.categoryCoverImg" alt="" />
        <div class="van-ellipsis">{{ item.thirdCategoryName }}</div>
      </div>
    </div>
    <div class="filter" v-if="!expand">
      <span>排序：</span>
      <span v-for="item in filterList" :key="item.value" :class="{ active: item.value === active }"
        @click="onFilter(item.value)">{{ item.label }}</span>

      <ListResetSwitchLayout @onResetListSort="handleResetListSort" @onChangeListLayout="handleChangeListLayout" />
    </div>
    <Loading v-if="init" />
    <van-pull-refresh v-else v-model="refresh" @refresh="onRefresh">
      <van-list v-if="sum" v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <div class="masonry-grid" :class="'masonry-grid' + value">
          <div class="gutter-size"></div>
          <div class="grid-item" v-for="(data, idx) in list" :key="idx" :style="gridItemStyle">
            <div class="data-item banner" v-if="data.type === 'banner'" :key="'banner' + idx">
              <Advertise :banner="data.data" />
              <div class="banner-title">{{ data.data.bannerName }}</div>
            </div>
            <MovieItem v-else :key="idx" :videoInfo="data" :coverHeight="data.coverHeight" />
          </div>
        </div>
      </van-list>
      <div class="empty-box" v-else>
        <van-empty :image="require('@/assets/images/emptyImage.png')" image-size="100" description="暂无内容" />
      </div>
    </van-pull-refresh>
  </div>
</template>

<script>
import { listMediaBySearchType, listPageBySecondCategoryId } from '@/apis/media'
import { useInsert, useThirdNavigation } from '@/hooks'
import Loading from '@/components/Loading'
import MovieItem from '@/components/MovieItem'
import Advertise from '@/components/Advertise'
import ListResetSwitchLayout from '@/components/ListResetSwitchLayout'
import Masonry from 'masonry-layout'
import { ListLayoutTagEnum } from '@/enums'

export default {
  components: { Loading, MovieItem, Masonry, Advertise, ListResetSwitchLayout },
  props: {
    value: {
      type: String,
      default: '',
    },
    expand: {
      type: String,
      default: '',
    },
    child: {
      type: Array,
      default: () => [],
    },
    noticeText: {
      type: String,
      default: '',
    },
    insertBanner: {
      type: Array,
      default: () => [],
    },
    topBanner: {
      type: Array,
      default: () => [],
    },
    level: {
      type: String | Number,
      default: 2,
    },
  },
  data() {
    return {
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      init: true,
      list: [],
      loading: false,
      refresh: false,
      finished: false,
      banner_index: 0,
      sum: 0,
      scrollTop: 0,
      active: 'SORT_PUBLISH_WEIGHT',
      filterList: [
        { value: 'SORT_PUBLISH_WEIGHT', label: '最新' },
        { value: 'SORT_VIEW', label: '观看数' },
        { value: 'SORT_FAVOR', label: '点赞数' },
      ],
      gridItemStyle: 'calc((100% - 10px) / 2)'
    }
  },
  computed: {
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
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
  methods: {
    onFilter(e) {
      if (this.active !== e) {
        this.active = e
        this.useData(true)
      }
    },
    handleclick(e) {
      this.$router.push({
        path: '/movieList',
        query: {
          label: e.thirdCategoryName,
          categoryId: e.categoryId,
        },
      })
    },
    handleResetListSort() {
      if (this.active == 'SORT_PUBLISH_WEIGHT' || this.active == 'SORT_PUBLISH') return
      this.active = 'SORT_PUBLISH_WEIGHT'
      this.useData(true)
    },
    handleChangeListLayout(e) {
      if (e == ListLayoutTagEnum.row) {
        this.gridItemStyle = { width: '100%' }
      } else {
        this.gridItemStyle = {}
      }
    },
    async useData(e = null) {
      let response
      try {
        if (this.expand === '/newUpdate') {
          const params = {
            ...this.page,
            orderType: 'SORT_PUBLISH',
            mediaType: 1,
          }
          response = await listMediaBySearchType(params)
        } else {
          const params = {
            ...this.page,
            orderType: this.active,
            mediaType: 1,
            categoryId: this.value,
          }
          response = await listPageBySecondCategoryId(params)
        }

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
          if (this.refresh || e) {
            this.refresh = false
            this.list = result
            this.sum = response.data.dataList.length
          } else {
            this.list = this.list.concat(result)
            this.sum += response.data.dataList.length
          }
          if (this.init) {
            this.init = false
          }
          if (this.loading) {
            this.loading = false
          }
          this.finished = this.page.pageSize > response.data.dataList.length
        }
      } catch (error) {
        throw error
      } finally {
        this.init = false
        this.refresh = false
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
  },
  updated() {
    const LayoutDom = document.querySelector('.masonry-grid' + this.value)
    if (LayoutDom) {
      new Masonry(LayoutDom, {
        itemSelector: '.grid-item',
        gutter: '.gutter-size',
      })
    }
  },
  created() {
    this.useData()
  },
}
</script>

<style scoped lang="less">
.list {
  .filter {
    display: flex;
    background: rgba(147, 232, 251, 0.3);
    border-radius: 6px;
    margin-bottom: 10px;
    padding: 10px 6px;
    font-size: 15px;
    align-items: center;

    &>span:not(:first-of-type) {
      margin-right: 16px;

      &.active {
        color: var(--theme-color);
      }
    }
  }

  .thrid {
    display: flex;
    flex-wrap: wrap;

    &>div {
      width: calc((100% - 15px) / 4);
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 12px;
      color: #000;

      img {
        width: 100%;
        border-radius: 4px;
        margin-bottom: 4px;
      }

      &>div {
        width: 100%;
        text-align: center;
      }

      &:not(:nth-of-type(4n)) {
        margin-right: 5px;
      }
    }
  }

  ::v-deep .van-notice-bar {
    padding: 0;
  }

  ::v-deep .van-pull-refresh {
    .van-list {
      .masonry-grid {
        .gutter-size {
          width: 10px;
        }

        .grid-item {
          width: calc((100% - 10px) / 2);

          .banner {
            margin-bottom: 10px;
            background: none;
            color: #fff;
            box-shadow: none;
            font-size: 12px;

            .banner-title {
              color: #000;
            }
          }
        }
      }
    }
  }
}
</style>
