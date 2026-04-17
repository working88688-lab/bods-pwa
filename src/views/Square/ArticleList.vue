<template>
  <div class="page-container">
    <Header
      textColor="#222222"
      color="#fff"
      :title="title"
      @onClickLeft="onBack"
    />
    <div class="page-content">
      <Loading v-if="isInit" />
      <template v-else>
        <div class="empty-box" v-if="!dataList.length">
          <van-empty
            :image="require('@/assets/images/emptyImage.png')"
            image-size="120"
            description="暂无数据哦~"
          />
        </div>
        <vue-loadmore
          v-else
          :on-refresh="onRefresh"
          :on-loadmore="onLoad"
          :finished="finished"
          class="movie-list"
        >
          <div>
            <Dynamic
              v-for="(dynamic, idx) in dataList"
              :key="idx"
              type="brokeNews"
              :dynamic="dynamic"
              :showDivider="idx !== dataList.length - 1"
              :showFlow="
                !userInfo || dynamic.userInfoPo.userId !== userInfo.userId
              "
              @changeData="handleChangeData($event, idx)"
              @onComment="handleComment"
            />
          </div>
        </vue-loadmore>
      </template>
      <Comment
        v-if="showComment"
        ref="comment"
        :videoInfo="rowData"
        @addComment="handleAddComment"
        @close="handleCloseComment"
      />
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { listMediaBySearchType } from '@/apis/media'
import { formatStrNum, formatDuration } from '@/utils/tools'
import _ from 'lodash'
import Comment from '@/components/Comment'
import Dynamic from '@/components/Dynamic'

export default {
  name: 'ArticleList',
  components: {
    Header,
    Loading,
    Comment,
    Dynamic,
  },
  data() {
    return {
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      isInit: true,
      finished: false,
      dataList: [],
      title: '',
      categoryId: '',
      showComment: false,
      rowData: null,
      scrollTop: 0,
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
  },
  created() {
    this.init()
  },
  activated() {
    this.init()
    this.$nextTick(() => {
      document.documentElement.scrollTop = this.scrollTop
    })
  },
  beforeRouteLeave(to, from, next) {
    this.scrollTop = document.documentElement.scrollTop
    next()
  },
  methods: {
    init() {
      if (this.$route.query.categoryId) {
        if (this.$route.query.categoryId !== this.categoryId) {
          const { categoryId, label } = this.$route.query
          this.title = label
          this.categoryId = categoryId
          this.page.pageNo = 1
          this.isInit = true
          this.finished = false
          this.dataList = []
          this.showComment = false
          this.rowData = null
          this.getDataList()
        }
      } else {
        this.$router.push('/square')
      }
    },
    onBack() {
      this.$router.go(-1)
    },
    async getDataList(done, isRefresh) {
      let params = {
        ...this.page,
        mediaType: 3,
        categoryId: this.categoryId,
        orderType: 'SORT_PUBLISH',
      }
      const res = await listMediaBySearchType(params).catch(() => {
        this.isInit = false
        done && done()
      })
      this.isInit = false
      done && done()
      if (res && res.code === 0) {
        const resultData = res.data.dataList.map(one => {
          if (one.article.picUrl) {
            one.article.picUrl = JSON.parse(one.article.picUrl)
          }
          if (one.article.videoUrl) {
            one.article.videoUrl = JSON.parse(one.article.videoUrl)
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
    formatDurationStr(num) {
      return formatDuration(num)
    },
    onPlay(videoInfo) {
      this.$router.push({
        path: '/play',
        query: {
          videoId: videoInfo.mediaId,
        },
      })
    },
    handleChangeData({ data, action }, idx) {
      if (action === 'like' || action === 'buy') {
        this.$set(this.dataList, idx, data)
      } else if (action === 'follow') {
        this.dataList.forEach((one, i) => {
          if (data.userInfoPo.userId === one.userInfoPo.userId) {
            let targetData = Object.assign({}, one)
            targetData.hasFollow = data.hasFollow
            this.$set(this.dataList, i, targetData)
          }
        })
      }
    },
    handleComment(data) {
      this.rowData = data
      this.showComment = true
      this.$nextTick(() => {
        this.$refs.comment.onShowComment()
      })
    },
    handleAddComment() {
      const targetIndex = _.findIndex(
        this.dataList,
        one => one.mediaId === this.rowData.mediaId
      )
      const targetData = this.dataList[targetIndex]
      targetData.commentCount += 1
      this.$set(this.dataList, targetIndex, targetData)
    },
    handleCloseComment() {},
  },
}
</script>

<style lang="less" scoped>
.page-content {
  padding: 64px 0 0;
  min-height: 100vh;
  box-sizing: border-box;
  background: #f6f6f6;
}
.movie-list {
  padding: 0 16px;
}
.movie-row {
  display: flex;
  flex-flow: wrap;
}
.movie-item {
  width: 100%;
  margin-bottom: 24px;
  position: relative;
  .video-top {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    .free {
      padding: 4px 8px;
      font-size: 12px;
      color: #fff;
      background: #30d158;
      overflow: hidden;
      border-radius: 0 8px 0 8px;
    }
    .gold {
      padding: 4px 8px;
      font-size: 12px;
      color: #222222;
      background: rgb(255 227 0);
      overflow: hidden;
      border-radius: 0 8px 0 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      img {
        width: 9px;
        height: 9px;
        margin-left: 4px;
      }
    }
    .level {
      padding: 4px 8px;
      font-size: 12px;
      color: #fff;
      background: #ff613d;
      overflow: hidden;
      border-radius: 0 8px 0 8px;
    }
    .vip {
      padding: 4px 8px;
      font-size: 12px;
      color: #fff;
      background: #109fff;
      overflow: hidden;
      border-radius: 0 8px 0 8px;
    }
  }
  .sort {
    width: 34px;
    height: 43px;
    line-height: 33px;
    text-align: center;
    font-weight: bold;
    font-size: 22px;
    color: #7e4c00;
    background: url(../../assets/images/sort.png) center / 100% no-repeat;
    overflow: hidden;
    position: absolute;
    left: 0;
    top: -18px;
    z-index: 1;
  }
  .video-cover {
    height: 192px;
    position: relative;
    img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }
    .cover-bottom {
      width: 100%;
      padding: 6px 12px;
      position: absolute;
      left: 0;
      bottom: 0;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      .duration {
        height: 18px;
        line-height: 18px;
        min-width: 40px;
        text-align: center;
        color: #fff;
        background: #000000;
        font-size: 12px;
        border-radius: 2px;
        padding: 0 4px;
      }
    }
  }
  .bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 12px 0 0;
    > div:first-child {
      width: calc(100% - 60px);
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .like {
      width: 60px;
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      font-size: 12px;
      img {
        width: 16px;
        margin-right: 6px;
      }
    }
  }
}
</style>
