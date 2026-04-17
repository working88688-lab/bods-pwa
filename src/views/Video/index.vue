<template>
  <div class="player-content">
    <div class="page-top">
      <van-tabs
        v-model="activedTab"
        background="none"
        :line-width="0"
        :ellipsis="false"
        :swipeable="true"
        :animated="true"
        class="main-tabs"
        @change="onChange"
        lazy-render
      >
        <van-tab
          v-for="(tab, idx) in tabList"
          :key="idx"
          :title="tab.label"
          :name="tab.categoryId"
        ></van-tab>
        <div class="left-icon" slot="nav-left">
          <van-icon name="arrow-left" @click="onBack" />
        </div>
        <div class="right-icon" slot="nav-right">
          <van-icon name="search" @click="onRoute('/search?mediaType=2')" />
        </div>
      </van-tabs>
    </div>
    <Loading v-if="isInit" />
    <van-swipe
      v-else
      ref="videoSwiper"
      :initial-swipe="initialSwipe"
      vertical
      :touchable="true"
      :loop="isLoop"
      :show-indicators="false"
      @change="onSwipeChange"
    >
      <van-swipe-item v-if="playVideo0">
        <div
          class="video-item"
          v-show="playVideo0.type !== 'banner'"
          @click="onClickSwiper(0)"
        >
          <FullScreenPlayer
            ref="videoPlayer0"
            :id="playVideo0.mediaId"
            :mediaType="playVideo0.mediaType"
            :video="playVideo0.video.videoUrl"
            :videoCover="playVideo0.video.videoCoverImg"
            :isAddView="false"
            :isAdvertise="playVideo0.type === 'banner'"
            :isCanPlay="videoCanPlaying && swiperIndex === 0"
            :isLoop="false"
            :autoplay="false"
            @ended="handleEnded"
          />
          <VideoItem
            :video="playVideo0"
            @onBuy="handleBuy"
            @handleComment="onComment($event)"
            @handleFavor="handleFavor($event, 'playVideo0')"
          />
        </div>
        <Advertise
          v-if="playVideo0.type === 'banner'"
          :banner="playVideo0.data"
        />
      </van-swipe-item>
      <van-swipe-item v-if="playVideo1">
        <div
          class="video-item"
          v-show="playVideo1.type !== 'banner'"
          @click="onClickSwiper(1)"
        >
          <FullScreenPlayer
            ref="videoPlayer1"
            :id="playVideo1.mediaId"
            :mediaType="playVideo1.mediaType"
            :video="playVideo1.video.videoUrl"
            :videoCover="playVideo1.video.videoCoverImg"
            :isAddView="false"
            :isAdvertise="playVideo1.type === 'banner'"
            :isCanPlay="videoCanPlaying && swiperIndex === 1"
            :isLoop="false"
            :autoplay="false"
            @ended="handleEnded"
          />
          <VideoItem
            :video="playVideo1"
            @onBuy="handleBuy"
            @handleComment="onComment($event)"
            @handleFavor="handleFavor($event, 'playVideo1')"
          />
        </div>
        <Advertise
          v-if="playVideo1.type === 'banner'"
          :banner="playVideo1.data"
        />
      </van-swipe-item>
      <van-swipe-item v-if="playVideo2">
        <div
          class="video-item"
          v-show="playVideo2.type !== 'banner'"
          @click="onClickSwiper(2)"
        >
          <FullScreenPlayer
            ref="videoPlayer2"
            :id="playVideo2.mediaId"
            :mediaType="playVideo2.mediaType"
            :video="playVideo2.video.videoUrl"
            :videoCover="playVideo2.video.videoCoverImg"
            :isAddView="false"
            :isAdvertise="playVideo2.type === 'banner'"
            :isCanPlay="videoCanPlaying && swiperIndex === 2"
            :isLoop="false"
            :autoplay="false"
            @ended="handleEnded"
          />
          <VideoItem
            :video="playVideo2"
            @onBuy="handleBuy"
            @handleComment="onComment($event)"
            @handleFavor="handleFavor($event, 'playVideo2')"
          />
        </div>
        <Advertise
          v-if="playVideo2.type === 'banner'"
          :banner="playVideo2.data"
        />
      </van-swipe-item>
    </van-swipe>
    <Comment
      v-if="showComment"
      ref="comment"
      :videoInfo="videoList[activedIndex]"
      @addComment="handleAddComment"
    />
  </div>
</template>

<script>
import {
  listShortVideoRandom,
  purchase,
  getMediaById,
  viewAdd,
} from '@/apis/media'
import FullScreenPlayer from '@/components/FullScreenPlayer'
import SideBar from '@/views/Video/components/SideBar'
import VideoItem from '@/views/Video/components/VideoItem'
import _ from 'lodash'
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
import { Dialog } from 'vant'
import Advertise from '@/components/Advertise'
import Loading from '@/components/Loading'
import Comment from '@/components/Comment'
import { banner } from '@/apis/data'

export default {
  name: 'VideoCategory',
  components: {
    FullScreenPlayer,
    SideBar,
    VideoItem,
    Swiper,
    SwiperSlide,
    Advertise,
    Loading,
    Comment,
  },
  computed: {
    appFooter() {
      return this.$store.state.appFooter
    },
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    bannerList() {
      if (this.$store.state.banner && this.$store.state.banner['shortVideo']) {
        console.log(this.$store.state.banner['shortVideo'])

        return this.$store.state.banner['shortVideo']
      } else {
        return []
      }
    },
  },
  data() {
    return {
      isInit: true,
      activedTab: null,
      tabList: [],
      videoList: [],
      page: {
        pageSize: 10,
        pageNo: 1,
      },
      swiperIndex: 0,
      initialSwipe: 0,
      activedIndex: 0,
      playVideo0: null,
      playVideo1: null,
      playVideo2: null,
      isLoop: false,
      prevIndex: 0,
      showComment: false,
    }
  },
  async created() {
    const targetData = this.appFooter.find(one => one.expand === '/video')
    if (targetData && targetData.child) {
      this.tabList = targetData.child
        .map(one => {
          // 默认读取二级分类下的第一个三级分类
          if (one.child && one.child[0]) {
            return {
              label: one.secondCategoryName,
              categoryId: one.child[0].categoryId,
            }
          } else {
            return null
          }
        })
        .filter(one => one)
      if (this.tabList.length) {
        this.activedTab = this.tabList[0].categoryId
        this.getVideoList(true)
      }
    }
  },
  activated() {
    this.initialSwipe = this.swiperIndex
    this.videoCanPlaying = true
    this.activatedPlay()
  },
  deactivated() {
    this.videoCanPlaying = false
    this.deactivatedStop()
  },
  mounted() {},
  methods: {
    onBack() {
      this.$router.replace('/movie')
    },
    onRoute(path) {
      this.$router.push(path)
    },
    onChange() {
      this.isInit = true
      this.swiperIndex = 0
      this.initialSwipe = 0
      this.activedIndex = 0
      this.prevIndex = 0
      this.page.pageNo = 1
      this.getVideoList(true)
    },
    activatedPlay() {
      if (
        this.$refs['videoPlayer' + this.swiperIndex] &&
        this.videoList[this.activedIndex].type !== 'banner'
      ) {
        this.$refs['videoPlayer' + this.swiperIndex].play()
      }
    },
    deactivatedStop() {
      if (
        this.$refs['videoPlayer' + this.swiperIndex] &&
        this.videoList[this.activedIndex].type !== 'banner'
      ) {
        this.$refs['videoPlayer' + this.swiperIndex].stop()
      }
    },
    onClickSwiper(index) {
      const status = this.$refs['videoPlayer' + index].getPlayStatus()
      if (status) {
        this.$refs['videoPlayer' + index].play()
      } else {
        this.$refs['videoPlayer' + index].stop()
      }
    },
    async onSwipeChange(index, data) {
      this.swiperIndex = index
      let direction = ''
      if (index === 0 && this.prevIndex === 2) {
        direction = 'toTop'
        this.activedIndex++
      } else if (index === 2 && this.prevIndex === 0) {
        direction = 'toBottom'
        this.activedIndex--
      } else {
        if (index > this.prevIndex) {
          direction = 'toTop'
          this.activedIndex++
        } else {
          direction = 'toBottom'
          this.activedIndex--
        }
      }
      if (this.$refs['videoPlayer' + this.prevIndex]) {
        this.$refs['videoPlayer' + this.prevIndex].stop()
      }
      if (
        this.$refs['videoPlayer' + this.swiperIndex] &&
        this.videoList[this.activedIndex].type !== 'banner'
      ) {
        this.$refs['videoPlayer' + this.swiperIndex].play()
      }

      // 确保视频暂停跟播放操作完成
      setTimeout(() => {
        this.prevIndex = index
      }, 100)

      // 预加载下一个视频
      if (direction === 'toTop') {
        if (this.videoList[this.activedIndex + 1]) {
          if (index === 0) {
            this.playVideo1 = this.videoList[this.activedIndex + 1]
          }
          if (index === 1) {
            this.playVideo2 = this.videoList[this.activedIndex + 1]
          }
          if (index === 2) {
            this.playVideo0 = this.videoList[this.activedIndex + 1]
          }
        }
      } else {
        if (this.videoList[this.activedIndex - 1]) {
          if (index === 0) {
            if (this.videoList[this.activedIndex - 1]) {
              this.playVideo2 = this.videoList[this.activedIndex - 1]
            }
          }
          if (index === 1) {
            if (this.videoList[this.activedIndex - 1]) {
              this.playVideo0 = this.videoList[this.activedIndex - 1]
            }
          }
          if (index === 2) {
            if (this.videoList[this.activedIndex - 1]) {
              this.playVideo1 = this.videoList[this.activedIndex - 1]
            }
          }
        }
      }
      if (
        this.videoList[this.activedIndex] &&
        this.videoList[this.activedIndex].type !== 'banner'
      ) {
        await viewAdd({
          mediaId: this.videoList[this.activedIndex].mediaId,
          mediaType: this.videoList[this.activedIndex].mediaType,
          randomId: this.videoList[this.activedIndex].randomId,
          cycleFinish: this.videoList[this.activedIndex].cycleFinish,
          categoryId: this.videoList[this.activedIndex].categoryId
        })
        if (this.videoList.length - this.activedIndex <= 2) {
            this.getVideoList(false)
        }
      }
      if (
        this.activedIndex === 0 ||
        this.activedIndex === this.videoList.length
      ) {
        this.isLoop = false
      } else {
        this.isLoop = true
      }
    },
    async getVideoList(isRefresh) {
      const res = await listShortVideoRandom({
        ...this.page,
        mediaType: 2,
        categoryId: this.activedTab,
      }).catch(() => {
        this.isInit = false
      })
      this.isInit = false
      if (res && res.code === 0) {
        const banner = _.sample(this.bannerList)
        const resultList = banner
          ? res.data.concat([
              { type: 'banner', data: banner, video: {} },
            ])
          : res.data
        if (isRefresh) {
          this.videoList = resultList
        } else {
          this.videoList = this.videoList.concat(resultList)
        }
        this.videoList = this.videoList.map((one, index) => {
          return {
            index,
            ...one,
          }
        })
        if (isRefresh) {
          if (this.videoList[0]) {
            this.playVideo0 = this.videoList[0]
          }
          if (this.videoList[1]) {
            this.playVideo1 = this.videoList[1]
          }
          if (this.videoList[2]) {
            this.playVideo2 = this.videoList[2]
          }
          if (
            this.playVideo0 &&
            this.playVideo0.type !== 'banner'
          ) {
            viewAdd({
              mediaId: this.playVideo0.mediaId,
              mediaType: this.playVideo0.mediaType,
              randomId: this.playVideo0.randomId,
              cycleFinish: this.playVideo0.cycleFinish,
              categoryId: this.playVideo0.categoryId
            })
          }
        }
      }
    },
    onRoute(path) {
      this.$router.push(path)
    },
    async handleBuy(data) {
      if (event && event.stopPropagation) {
        event.stopPropagation()
      } else {
        window.event.cancelBubble = true
      }
      if (!this.userInfo) {
        await this.$store.dispatch('macLogin')
      }
      if (this.userInfo.coinBalance < data.goldPayUnit) {
        return this.$toast('余额不足')
      }
      Dialog.confirm({
        title: '提示',
        message: `您确定要花费${data.goldPayUnit}金币购买完整视频吗？`,
        className: 'confirm-dialog',
      })
        .then(async () => {
          const params = {
            mediaId: data.mediaId,
            mediaType: data.mediaType,
          }
          this.loading = true
          const res = await purchase(params).catch(() => {
            this.loading = false
          })
          this.loading = false
          if (res && res.code === 0) {
            const userData = Object.assign({}, this.userInfo)
            userData.coinBalance = userData.coinBalance - data.goldPayUnit
            this.$store.commit('SET_USERINFO', userData)
            this.$toast('购买成功')
            const idx = _.findIndex(
              this.videoList,
              one => one.mediaId === data.mediaId
            )
            this.handleSuccess(data, idx)
          }
        })
        .catch(() => {})
    },
    async handleSuccess(data, idx) {
      const params = {
        mediaId: data.mediaId,
        mediaType: data.mediaType,
      }
      const res = await getMediaById(params)
      if (res && res.code === 0) {
        this.$set(this.videoList, idx, res.data)
        this.$nextTick(() => {
          this.activatedPlay()
        })
      }
    },
    handleEnded(id) {
      const targetIdx = _.findIndex(this.videoList, one => one.mediaId === id)
      if (targetIdx === this.activedIndex) {
        const activedVideo = this.videoList[this.activedIndex]
        if (activedVideo.payType === 2) {
          if (!this.userInfo) {
            Dialog.confirm({
              title: '提示',
              message: `试看结束，充值金币解锁完整视频`,
              className: 'confirm-dialog',
            })
              .then(async () => {
                this.onRoute('/login')
              })
              .catch(() => {})
          } else if (this.userInfo.coinBalance < activedVideo.goldPayUnit) {
            Dialog.confirm({
              title: '提示',
              message: `试看结束，充值金币解锁完整视频`,
              className: 'confirm-dialog',
            })
              .then(async () => {
                this.onRoute('/recharge')
              })
              .catch(() => {})
          } else {
            Dialog.confirm({
              title: '提示',
              message: `试看结束，是否花费${activedVideo.goldPayUnit}金币购买完整视频？`,
              className: 'confirm-dialog',
            })
              .then(async () => {
                const params = {
                  mediaId: activedVideo.mediaId,
                  mediaType: activedVideo.mediaType,
                }
                this.loading = true
                const res = await purchase(params).catch(() => {
                  this.loading = false
                })
                this.loading = false
                if (res && res.code === 0) {
                  const userData = Object.assign({}, this.userInfo)
                  userData.coinBalance =
                    userData.coinBalance - activedVideo.goldPayUnit
                  this.$store.commit('SET_USERINFO', userData)
                  this.$toast('购买成功')
                  const targetIdx = _.findIndex(
                    this.videoList,
                    one => one.mediaId === activedVideo.mediaId
                  )
                  this.handleSuccess(activedVideo, targetIdx)
                }
              })
              .catch(() => {})
          }
        } else if (activedVideo.payType === 3) {
          Dialog.confirm({
            title: '提示',
            message: `试看结束，提升等级解锁完整视频`,
            className: 'confirm-dialog',
          })
            .then(async () => {
              this.onRoute('/vip')
            })
            .catch(() => {})
        } else if (activedVideo.payType === 4) {
          Dialog.confirm({
            title: '提示',
            message: `试看结束，开通VIP解锁完整视频`,
            className: 'confirm-dialog',
          })
            .then(async () => {
              this.onRoute('/vip')
            })
            .catch(() => {})
        }
      }
    },
    handleFavor(data, filed) {
      this.$set(this.videoList, this.activedIndex, data)
      this[filed] = data
    },
    onComment(data) {
      this.showComment = true
      this.$nextTick(() => {
        this.$refs.comment.onShowComment()
      })
    },
    handleAddComment() {
      this.$set(
        this.videoList[activedIndex],
        'commentCount',
        this.videoList[activedIndex].commentCount + 1
      )
    },
  },
}
</script>

<style lang="less" scoped>
.player-content {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
}

.page-top {
  width: 100%;
  position: absolute;
  top: var(--safe-area-top);
  left: 0;
  z-index: 99;
}

::v-deep .main-tabs {
  > .van-tabs__wrap {
    position: relative;

    > .van-tabs__nav {
      width: 100%;
      padding-left: 44px;
      padding-right: 44px;
      box-sizing: border-box;
      position: unset;
      justify-content: center;

      > .left-icon,
      > .right-icon {
        width: 44px;
        height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #fff;

        .van-icon {
          font-size: 24px;
        }
      }

      > .left-icon {
        position: absolute;
        left: 0;
      }

      > .right-icon {
        position: absolute;
        right: 0;
      }
    }
  }
}

::v-deep .van-swipe {
  width: 100%;
  height: 100%;
  position: relative;

  .van-swipe-item {
    // padding-bottom: 64px;
    .banner-item {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 66;
      top: 0;
      left: 0;
      background: #fefbef;
    }
  }
}

.video-item {
  height: 100%;
  width: 100%;
  overflow: hidden;

  .cover-img {
    width: 100%;
    height: 100%;
    background-color: #111111;
    object-fit: cover;
  }
}

::v-deep .xgplayer {
  video {
    object-fit: cover;
  }

  .xgplayer-poster {
    background-size: cover;
  }
}
</style>
