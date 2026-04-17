<template>
  <div class="list">
    <div
      class="sticky-top"
      v-sticky="{ zIndex: 99, stickyTop: -1, disabled: false }"
      @touchstart.stop
      @touchmove.stop
      @touchend.stop
    >
      <div
        v-if="!expand"
        class="thrid"
      >
        <div
          v-for="item in child"
          :key="item.categoryId"
          @click="handleclick(item)"
        >
          <img
            v-lazy="imageBase + item.categoryCoverImg"
            alt=""
          />
          <div class="van-ellipsis">{{ item.thirdCategoryName }}</div>
        </div>
      </div>
      <div class="filter">
        <div>
          <span>{{ filter1.title }}:</span>
          <span
            v-for="item in filter1.list"
            :key="item.value"
            :class="{ active: item.value === searchType }"
            @click="onFilter(filter1.key, item.value)"
          >
            <span>{{ item.label }}</span>
          </span>
        </div>
        <div>
          <span>{{ filter2.title }}:</span>
          <span
            v-for="item in filter2.list"
            :key="item.value"
            :class="{ active: item.value === payType }"
            @click="onFilter(filter2.key, item.value)"
          >
            <span>{{ item.label }}</span>
          </span>
        </div>
        <div>
          <span>{{ filter3.title }}:</span>
          <span
            v-for="item in filter3.list"
            :key="item.value"
            :class="{ active: item.value === orderType }"
            @click="onFilter(filter3.key, item.value)"
          >
            <span>{{ item.label }}</span>
          </span>
          <!-- <span
            class="reset"
            @click="reset"
            >重置</span
          > -->
          <ListResetSwitchLayout @onResetListSort="handleResetListSort" @onChangeListLayout="handleChangeListLayout" />
        </div>
      </div>
    </div>
    <Loading v-if="init" />
    <van-pull-refresh
      v-else
      v-model="refresh"
      @refresh="onRefresh"
    >
      <van-list
        v-if="sum"
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div
          class="masonry-grid"
          :class="'masonry-grid' + value"
        >
          <div class="gutter-size"></div>
          <div
            class="grid-item"
            :style="{width: gridItemStyle}"
            v-for="(data, idx) in list"
            :key="idx"
          >
            <div
              class="data-item banner"
              v-if="data.type === 'banner'"
              :key="'banner' + idx"
            >
              <Advertise :banner="data.data" />
              <div class="banner-title">{{ data.data.bannerName }}</div>
            </div>
            <MovieItem
              v-else
              :key="idx"
              :videoInfo="data"
              :coverHeight="data.coverHeight"
            />
          </div>
        </div>
      </van-list>
      <div
        class="empty-box"
        v-else
      >
        <van-empty
          :image="require('@/assets/images/emptyImage.png')"
          image-size="100"
          description="暂无内容"
        />
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
    components: { Loading, MovieItem, Masonry,Advertise, ListResetSwitchLayout },
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
        if (this.$store.state.banner && this.$store.state.banner['comics_list']) {
          return this.$store.state.banner['comics_list']
        } else {
          return []
        }
      },
    },
    methods: {
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
        this.searchType = 0
        this.payType = null
        this.orderType = 'SORT_PUBLISH_WEIGHT'
        this.page.pageNo = 1
        this.useData(true)
      },
      handleChangeListLayout(e) {
        if (e == ListLayoutTagEnum.row) {
          this.gridItemStyle = '100%'
        } else {
          this.gridItemStyle = 'calc((100% - 10px) / 2)'
        }
      },
      async useData(e = null) {
        try {
          const params = {
            ...this.page,
            orderType: this.orderType,
            mediaType: 1,
            categoryId: this.value,
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
  .sticky-top {
    background: #f2f2f4;
    // padding-bottom: 10px;
    // position: sticky;
    // top: -1px;
  }
  .banner-title{
    color: #000;
  }
  .list {
    padding: 0 12px;
    .filter {
      background: rgba(147, 232, 251, 0.3);
      border-radius: 6px;
      margin-bottom: 8px;
      padding: 10px 6px;
      font-size: 14px;
      & > div:not(:first-of-type) {
        margin-top: 10px;
      }

      & > div {
        display: flex;
        & > span {
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
      }
    }
    .thrid {
      display: flex;
      flex-wrap: wrap;
      & > div {
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
        & > div {
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

            .banner {
              margin-bottom: 10px;
              background: none;
              color: #fff;
              box-shadow: none;
              font-size: 12px;
            }
          }
        }
      }
    }
  }
</style>
