<template>
  <div class="recommend-page">
    <Header
      color="#fff"
      textColor="#222222"
      title="每日"
      @onClickLeft="onBack"
    />
    <div class="page-content">
      <Loading v-if="isInit" height="200px" />
      <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh">
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
          class="movie-list"
          @load="onLoad"
        >
          <div class="movie-row">
            <template v-for="(data, idx) in dataList">
              <div
                class="movie-item banner"
                v-if="data.type === 'banner'"
                :key="'banner' + idx"
              >
                <Advertise :banner="data.data" />
                <div class="banner-title">{{ data.data.bannerName }}</div>
              </div>
              <MovieItem v-else :key="idx" :videoInfo="data" />
            </template>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script>
import { listMediaBySearchType } from '@/apis/media'
import { formatStrNum } from '@/utils/tools'
import MovieItem from '@/components/MovieItem'
import Loading from '@/components/Loading'
import _ from 'lodash'
import Advertise from '@/components/Advertise'
import Header from '@/components/Header'

export default {
  name: 'MovieLatest',
  components: {
    MovieItem,
    Loading,
    Advertise,
    Header,
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
      scrollTop: 0,
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
    // this.init()
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
    onBack() {
      this.$router.go(-1)
    },
    async init() {
      // 查询视频信息
      this.getDataList()
    },
    formatNum(num) {
      return formatStrNum(num)
    },
    onVideoType(data) {
      this.$router.push(data.path)
    },
    async getDataList(done, isRefresh) {
      let params = {
        ...this.page,
        mediaType: 9,
        orderType: 'SORT_PUBLISH',
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
          resultData = this.insertAd2List(10, res.data.dataList)
        } else {
          resultData = res.data.dataList
        }
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
      this.getVideoList()
    },
    onLoad(done) {
      this.page.pageNo++
      this.getDataList(done)
    },
  },
}
</script>

<style lang="less" scoped>
.page-content {
  padding-top: 44px;
}
.van-pull-refresh {
  padding: 12px 0 0;
}
.video-type-list {
  display: flex;
  padding: 8px 0 16px;
  .video-type-item {
    width: 25%;
    text-align: center;
    img {
      width: 36px;
      height: 36px;
    }
    div {
      font-size: 14px;
      color: #f8f8f8;
    }
  }
}
.video-section {
  padding: 0 16px 0px;
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    .title {
      width: 280px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 18px;
      color: #222222;
      font-weight: bold;
      position: relative;
      padding-left: 32px;
    }
    .title::after {
      content: '';
      width: 24px;
      height: 24px;
      background: url(../../../assets/images/video.png) no-repeat top center /
        100%;
      position: absolute;
      left: 0;
      bottom: 0;
    }
    .more {
      display: inline-flex;
      align-items: center;
      width: 50px;
      justify-content: flex-end;
      font-size: 12px;
      color: #109fff;
    }
  }
  .movie-list-wraper {
    overflow-x: auto;
    .movie-list {
      display: flex;
      flex-flow: wrap;
    }
    .V_H1L5 {
      width: 230%;
      overflow-x: scroll;
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
.movie-row {
  display: flex;
  flex-flow: wrap;
  justify-content: space-between;
  padding: 0 12px;
}
.banner {
  width: 100%;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
  .banner-item {
    position: relative;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .banner-title {
    width: 100%;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
