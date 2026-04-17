<template>
  <div class="page-container">
    <Header title="短视频" textColor="#fff" @onClickLeft="onBack" />
    <div class="page-content" :style="{ height: height }" v-if="videoInfo">
      <FullScreenPlayer
        ref="fullScreenPlayerRef"
        :id="videoInfo.video.videoId"
        :video="videoInfo.video.videoUrl"
        :videoCover="videoInfo.video.videoCoverImg"
        :isLoop="false"
        @ended="handleEnded"
      />
      <div class="video-info">
        <div
          class="preview-tip"
          v-if="videoInfo.preview"
          @click="onRoute('/vip')"
        >
          <div
            v-if="videoInfo.payType === 2"
            @click="onBuy($event, videoInfo, idx)"
          >
            预览10秒 金币购买看完整视频
          </div>
          <div v-if="videoInfo.payType === 3" @click="onRoute('/vip')">
            预览10秒 用户等级{{ videoInfo.userLevel }}看完整视频
          </div>
          <div v-if="videoInfo.payType === 4" @click="onRoute('/vip')">
            预览10秒 充VIP看完整视频
          </div>
        </div>
        <div class="video-name">{{ videoInfo.video.videoTitle }}</div>
        <div class="video-labels">
          <span
            class="label-item"
            v-for="(label, m) in videoInfo.tagList"
            :key="m"
            @click="onSearch(label)"
            >{{ label.tagName }}</span
          >
        </div>
      </div>
    </div>
    <SideBar
      :videoInfo="videoInfo"
      @handleFavor="handleFavor"
      @handleComment="handleComment"
    />
    <Comment
      v-if="showComment"
      ref="comment"
      :videoInfo="videoInfo"
      @addComment="handleAddComment"
      @close="handleCloseComment"
    />
  </div>
</template>

<script>
import Header from '@/components/Header'
import FullScreenPlayer from '@/components/FullScreenPlayer'
import SideBar from './components/SideBar'
import Comment from '@/components/Comment'
import { getMediaById, purchase } from '@/apis/media'
import { Dialog } from 'vant'

export default {
  name: 'VideoPlayer',
  components: { Header, FullScreenPlayer, SideBar, Comment },
  data() {
    return {
      videoId: '',
      videoInfo: null,
      showComment: false,
      height: window.innerHeight + 'px',
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
  },
  created() {
    this.videoId = this.$route.query.shortVideoId
    this.getVideoInfo()
  },
  activated() {
    const shortVideoId = this.$route.query.shortVideoId
    if (shortVideoId && shortVideoId !== this.videoId) {
      this.videoId = shortVideoId
      this.videoInfo = null
      this.showComment = false
      this.getVideoInfo()
    }
  },
  mounted() {},
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    async getVideoInfo() {
      if (!this.videoId) {
        return this.$router.push('/video')
      }
      const params = {
        mediaId: this.videoId,
        mediaType: 2,
      }
      const res = await getMediaById(params)
      if (res && res.code === 0) {
        this.videoInfo = res.data
      }
    },
    handleFavor(data) {
      this.videoInfo = data
    },
    handleComment() {
      this.showComment = true
      this.$nextTick(() => {
        this.$refs.comment.onShowComment()
      })
    },
    handleCloseComment() {
      // this.showComment = false
      // this.rowData = null
    },
    handleAddComment() {
      this.$set(this.videoInfo, 'commentCount', this.videoInfo.commentCount + 1)
    },
    onSearch(label) {
      this.$router.push({
        path: '/search',
        query: {
          label: label.tagName,
          type: 2,
        },
      })
    },
    onRoute(path) {
      this.$router.push(path)
    },
    async onBuy(event, data, idx) {
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
        message: `您确定要花费${this.userInfo.goldPayUnit}金币购买完整视频吗？`,
        className: 'confirm-dialog',
      })
        .then(async () => {
          const params = {
            mediaId: this.userInfo.mediaId,
            mediaType: this.userInfo.mediaType,
          }
          this.loading = true
          const res = await purchase(params).catch(() => {
            this.loading = false
          })
          this.loading = false
          if (res && res.code === 0) {
            const userData = Object.assign({}, this.userInfo)
            userData.coinBalance =
              userData.coinBalance - this.userInfo.goldPayUnit
            this.$store.commit('SET_USERINFO', userData)
            this.$toast('购买成功')
            this.handleSuccess(this.userInfo, idx)
          }
        })
        .catch(() => {})
    },
    handleEnded() {
      if (this.videoInfo.payType === 2) {
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
        } else if (this.userInfo.coinBalance < this.videoInfo.goldPayUnit) {
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
            message: `试看结束，是否花费${this.videoInfo.goldPayUnit}金币购买完整视频？`,
            className: 'confirm-dialog',
          })
            .then(async () => {
              const params = {
                mediaId: this.videoInfo.mediaId,
                mediaType: this.videoInfo.mediaType,
              }
              this.loading = true
              const res = await purchase(params).catch(() => {
                this.loading = false
              })
              this.loading = false
              if (res && res.code === 0) {
                const userData = Object.assign({}, this.userInfo)
                userData.coinBalance =
                  userData.coinBalance - this.videoInfo.goldPayUnit
                this.$store.commit('SET_USERINFO', userData)
                this.$toast('购买成功')
                const targetIdx = _.findIndex(
                  this.videoList,
                  one => one.mediaId === this.videoInfo.mediaId
                )
                this.handleSuccess(this.videoInfo, targetIdx)
              }
            })
            .catch(() => {})
        }
      } else if (this.videoInfo.payType === 3) {
        Dialog.confirm({
          title: '提示',
          message: `试看结束，提升等级解锁完整视频`,
          className: 'confirm-dialog',
        })
          .then(async () => {
            this.onRoute('/vip')
          })
          .catch(() => {})
      } else if (this.videoInfo.payType === 4) {
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
    },
    async handleSuccess(data, idx) {
      const params = {
        mediaId: data.mediaId,
        mediaType: data.mediaType,
      }
      const res = await getMediaById(params)
      if (res && res.code === 0) {
        this.userInfo = res.data
        this.$nextTick(() => {
          this.$refs.fullScreenPlayerRef.start()
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.page-container {
  position: relative;
}
.page-content {
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  .video-info {
    position: absolute;
    left: 16px;
    bottom: 64px;
    z-index: 99;
    color: #fff;
    font-size: 14px;
    .preview-tip {
      display: inline-block;
      padding: 0 16px;
      height: 32px;
      line-height: 32px;
      border-radius: 16px;
      background: linear-gradient(
        to right,
        rgb(240, 210, 138),
        rgb(214, 137, 69)
      );
      font-size: 14px;
      color: rgb(7, 11, 31);
    }
    .video-name {
      width: 280px;
      margin: 12px 0;
    }
    .video-labels {
      width: 280px;
      display: flex;
      flex-flow: wrap;
      margin: 12px 0;
      .label-item {
        background: #109fff;
        padding: 2px 6px;
        font-size: 12px;
        margin-right: 4px;
        border-radius: 2px;
      }
    }
  }
}
</style>
