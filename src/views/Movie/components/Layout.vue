<template>
  <div class="list" :ref="value">
    <div v-if="grid" class="grid">
      <div v-for="item in grid" :key="item.bannerCode">
        <Advertise :banner="item" />
        <span>{{ item.bannerName }}</span>
      </div>
    </div>
    <van-pull-refresh v-model="refresh" @refresh="onRefresh">
      <Loading v-if="init" />
      <template v-else>
        <van-list v-if="list.length" v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <div class="video-section" v-for="(item, idx) in list" :key="idx">
            <div class="movie-list-wraper">
              <MovieLayout :layout="item.style" :data="item" @change="handlechange" />
              <Banner location="thirdCategory_list" style="margin-bottom: 20px"
                v-if="insert_ad ? (idx + 1) % insert_ad === 0 : true" />
            </div>
          </div>
        </van-list>
        <div class="empty-box" v-else>
          <van-empty :image="require('@/assets/images/emptyImage.png')" image-size="100" description="暂无内容" />
        </div>
      </template>
    </van-pull-refresh>
  </div>
</template>

<script>
import { listMediaBySearchType, useListAll } from '@/apis/media'
import Loading from '@/components/Loading'
import MovieItem from '@/components/MovieItem'
import Advertise from '@/components/Advertise'
import Masonry from 'masonry-layout'
import MovieVH1L5 from '../Layout/MovieVH1L5.vue'
import MovieVH215 from '../Layout/MovieVH215.vue'
import { MovieLayout, Banner } from '@/components'

export default {
  components: {
    Loading,
    Masonry,
    MovieItem,
    Advertise,
    MovieVH1L5,
    MovieVH215,
    MovieLayout,
    Banner,
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    noticeText: {
      type: String,
      default: '',
    },
    topBanner: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      init: true,
      list: [],
      refresh: false,
      scrollTop: 0,
      layout: {
        0: { label: 'V_H1L2', value: 0, child: 2 },
        1: { label: 'V_H2L2', value: 1, child: 4 },
        2: { label: 'V_H1L5', value: 2, child: 5 },
        3: { label: 'V_H2L3', value: 3, child: 6 },
        4: { label: 'V_H2_2_2', value: 4, child: 4 },
        5: { label: 'V_H3_1_2_2', value: 5, child: 5 },
        6: { label: 'V_H1_6', value: 6, child: 6 },
        7: { label: 'V_H2_1_5', value: 7, child: 6 },
        10: { label: 'V_H1L1', value: 10, child: 6 },
      },
      topMin: 0,
      loading: false,
      finished: false,
      pages: {},
      page: {
        pageNo: 1,
        pageSize: 3,
      },
    }
  },
  computed: {
    dataDic() {
      return this.$store.state.dataDic
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    grid() {
      if (
        this.$store.state.banner &&
        this.$store.state.banner['insert_ad'] &&
        this.$store.state.banner['insert_ad'].length
      ) {
        return this.$store.state.banner['insert_ad']
      } else {
        return null
      }
    },
    insert_ad() {
      return this.$store.state.dataDic.insert_ad
    },
  },
  methods: {
    async handlechange({ data: { categoryId }, pageSize }) {
      if (this.pages[categoryId]) {
        this.pages[categoryId].pageNo++
      } else {
        this.pages = {
          ...this.pages,
          [categoryId]: {
            pageNo: 2,
            pageSize: pageSize,
          },
        }
      }
      try {
        const res = await listMediaBySearchType({
          ...this.pages[categoryId],
          mediaType: 1,
          categoryId,
          orderType: 'SORT_PUBLISH_WEIGHT',
          merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        })
        if (res && res.code === 0 && res.data.dataList) {
          this.list = this.list.map(item => ({
            ...item,
            mediaList: item.categoryId === categoryId ? res.data.dataList : item.mediaList,
          }))
          if (this.pages[categoryId].pageNo * this.pages[categoryId].pageSize >= res.data.total) {
            this.pages[categoryId].pageNo = 0
          }
        }
      } catch (error) {
        throw error
      }
    },
    async useData() {
      try {
        const response = await useListAll({
          categoryId: this.value,
          ...this.page,
        })

        if (response.code === 0 && response.data) {
          let result = response.data.dataList
          if (this.refresh) {
            this.list = result
          } else {
            this.list = this.list.concat(result)
          }
          this.finished = this.page.pageNo * this.page.pageSize >= response.data.total
        }
      } catch (error) {
        throw error
      } finally {
        this.init && (this.init = false)
        this.refresh && (this.refresh = false)
        this.loading && (this.loading = false)
      }
    },
    onRefresh() {
      this.finished = false
      this.page.pageNo = 1
      this.useData()
    },
    onLoad() {
      this.page.pageNo++
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
  ::v-deep .van-notice-bar {
    padding: 0;
  }

  .grid {
    display: flex;
    justify-content: space-between;
    padding: 16px 0 24px;

    &>div {
      width: 56px;
      display: flex;
      flex-direction: column;
      align-items: center;

      img {
        width: 56px;
        height: 56px;
        margin-bottom: 7px;
        object-position: center;
      }

      span {
        font-size: 12px;
        line-height: 1.5;
        color: #000;
      }
    }
  }

  ::v-deep .van-pull-refresh {
    .video-section {
      .top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .title {
          width: 280px;
          white-space: nowrap;
          // overflow: hidden;
          text-overflow: ellipsis;
          font-size: 18px;
          color: #f8f8f8;
          position: relative;
          padding-left: 8px;
        }

        .title::after {
          content: '';
          width: 16px;
          height: 16px;
          // background: url(../../../assets/images/title_left_bg2.png) no-repeat top center / 100%;
          position: absolute;
          top: -6px;
          left: 0;
        }

        .more {
          display: inline-flex;
          align-items: center;
          width: 50px;
          justify-content: flex-end;
          font-size: 12px;
          color: #ff375f;
        }
      }

      .movie-list-wraper {
        // overflow-x: auto;

        .movie-list {
          display: flex;
          flex-flow: wrap;
        }

        .V_H1L5 {
          // width: 230%;
          overflow-x: auto;
          flex-flow: nowrap;
        }

        .V_H1_6 {
          width: 230%;
          overflow-x: scroll;
          flex-flow: nowrap;
        }

        .second {
          overflow-x: auto;

          .secondV_H2_1_5 {
            width: 150%;
            overflow-x: scroll;
            flex-flow: nowrap;
          }
        }
      }
    }
  }
}
</style>
