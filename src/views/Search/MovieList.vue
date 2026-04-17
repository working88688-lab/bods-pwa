<template>
  <div>
    <Loading v-if="isInit" />
    <van-pull-refresh
      v-else
      v-model="refreshing"
      @refresh="onRefresh"
    >
      <div
        class="empty-box"
        v-if="!dataList.length"
      >
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
          <div
            class="grid-item"
            v-for="(data, idx) in dataList"
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
              :videoInfo="data"
              :coverHeight="data.coverHeight"
            />
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
  import { formatStrNum } from '@/utils/tools'
  import { searchMedia } from '@/apis/media'
  import Loading from '@/components/Loading'
  import MovieItem from '@/components/MovieItem'
  import Masonry from 'masonry-layout'
  import { useInsert } from '@/hooks'
  import Advertise from '@/components/Advertise'

  export default {
    name: 'MovieList',
    components: {
      Loading,
      MovieItem,
      Masonry,
      Advertise
    },
    props: {
      searchLabel: {
        type: String,
        default: '',
      },
      tag: {
        type: Boolean,
        default: false,
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
        banner_index: 0
      }
    },
    computed: {
      imageBase() {
        return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
      },
      dataDic() {
        return this.$store.state.dataDic
      },
      isApp() {
        return this.$store.state.isApp
      },
      device() {
        return this.$store.state.device
      },
      bannerList() {
        if (this.$store.state.banner && this.$store.state.banner['movie_list']) {
          return this.$store.state.banner['movie_list']
        } else {
          return []
        }
      },
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
    created() {
      this.getDataList(null, true)
    },
    methods: {
      async getDataList(done, isRefresh) {
        const params = {
          ...this.page,
          ...(this.tag ? { tags: [this.searchLabel] } : { searchKeyword: this.searchLabel }),
          mediaType: 1,
          orderType: 'SORT_PUBLISH_WEIGHT',
        }
        this.loading = true
        const res = await searchMedia(params).catch(() => {
          this.isInit = false
        })
        done && done()
        this.isInit = false
        this.loading = false
        if (this.refreshing) {
          this.refreshing = false
        }
        if (res && res.code === 0) {
          let dataList = res.data.dataList
          // if (this.bannerList.length) {
          //   dataList = useInsert(this.dataDic.inADNub || 10, dataList, this.bannerList[this.banner_index])
          //     if (this.banner_index < this.bannerList.length - 1) {
          //       this.banner_index++
          //     } else {
          //       this.banner_index = 0
          //     }
          //   }
          dataList = dataList.map(one => {
            if (one.type !== 'banner') {
              if (one.video && one.video.videoCoverImg && one.video.coverHeight) {
                one['coverHeight'] = (one.video.coverHeight / one.video.coverWidth).toFixed(2) * 100 + '%'
              } else {
                one['coverHeight'] = '100%'
              }
            }
            return one
          })
      if (this.bannerList.length) {
            dataList = useInsert(this.dataDic.inADNub || 10, dataList, this.bannerList[this.banner_index])
              if (this.banner_index < this.bannerList.length - 1) {
                this.banner_index++
              } else {
                this.banner_index = 0
              }
            }
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
  .banner-title{
    font-size: 12px;
  }
</style>
