<template>
  <div class="video-player-box">
    <div class="xgplay" :id="idName ? idName : 'xgplay' + id"></div>
    <div class="movie-ad-box" v-if="showMovieAd && adData">
      <img v-if="showMovieAd && adData" class="movie-ad" :src="cdnLine.cdnLine + adData.bannerImageUrl"
        @click="onClickBanner" />
      <div class="download" @click="closeDownload">
        <span v-if="adData.whetherSkip === 0">VIP跳过 {{ downTime }}s</span>
        <span v-else>{{ downTime }}s 后进入</span>
      </div>
    </div>
    <div class="water-mark">{{ this.dataDic.watermark }}</div>
  </div>
</template>

<script>
import _ from 'lodash'
import XGPlayer from 'xgplayer'
import HlsJsPlugin from 'xgplayer-hls'
import HlsJsPluginJs from 'xgplayer-hls.js'
import Hls from 'hls.js'
import { viewAdd } from '@/apis/media'
import { clickBanner } from '@/apis/data'

export default {
  name: 'VideoPlayer',
  props: {
    id: {
      type: String,
      default: '',
    },
    idName: {
      type: String,
      default: '',
    },
    mediaType: {
      type: Number,
      default: 1,
    },
    video: {
      type: String,
      default: '',
    },
    videoCover: {
      type: String,
      default: '',
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    loop: {
      type: Boolean,
      default: false,
    },
    adData: {
      type: Object,
      default: null,
    },
    canChangeClarity: {
      type: Boolean,
      default: false,
    },
    streamUrls: {
      type: Object,
      default: null,
    },
    progressDot: {
      type: Array,
      default: () => {
        return []
      },
    },
    isHls: {
      type: Boolean,
      default: false,
    },
    isAddView: {
      type: Boolean,
      default: false,
    },
    isShowDialogAd: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dPlayer: null,
      timer: null,
      downTime: this.adData ? Number(this.adData.advertiseTime) : 0,
      showMovieAd: true,
      customTagTimer: null,
    }
  },
  computed: {
    cdnLine() {
      return this.$store.state.cdnLine
    },
    userInfo() {
      return this.$store.state.userInfo
    },
    dataDic() {
      return this.$store.state.dataDic
    },
    dataChange() {
      const { video, isShowDialogAd } = this
      return { video, isShowDialogAd }
    },
  },
  watch: {
    cdnLine: {
      handler(newval) {
        if (newval) {
          this.$toast('切换至' + newval.cdnName)
          const videoUrl =
            this.video.indexOf('http') > -1
              ? this.video
              : this.cdnLine.cdnLine + this.video
          this.xgPlayer.src = videoUrl
          this.xgPlayer.config.url = videoUrl
        }
      },
    },
    dataChange: {
      handler(newval) {
        if (newval.isShowDialogAd) {
          if (this.adData) {
            this.showMovieAd = true
            this.timer !== null && clearInterval(this.timer)
            this.downTime = this.adData.advertiseTime
          }
          this.xgPlayer && this.xgPlayer.pause()
        } else if (!newval.isShowDialogAd) {
          if (this.adData) {
            this.showMovieAd = true
            this.downTime = this.adData.advertiseTime
            this.timer && clearInterval(this.timer)
            this.timer = setInterval(() => {
              if (this.downTime <= 0) {
                clearInterval(this.timer)
                this.showMovieAd = false
                if (this.xgPlayer) {
                  const videoUrl =
                    this.video.indexOf('http') > -1
                      ? this.video
                      : this.cdnLine.cdnLine + this.video
                  this.xgPlayer.src = videoUrl
                  this.xgPlayer.config.url = videoUrl
                  this.xgPlayer.play()
                } else {
                  this.initDplayer()
                }
              } else {
                this.downTime--
              }
            }, 1000)
          } else {
            this.showMovieAd = false
            if (this.xgPlayer) {
              const videoUrl =
                this.video.indexOf('http') > -1
                  ? this.video
                  : this.cdnLine.cdnLine + this.video
              this.xgPlayer.src = videoUrl
              this.xgPlayer.config.url = videoUrl
              this.xgPlayer.play()
            } else {
              this.initDplayer()
            }
          }
        }
      },
    },
  },
  created() {
    if (!this.isShowDialogAd) {
      if (this.adData) {
        this.showMovieAd = true
        this.downTime = this.adData.advertiseTime
        this.timer && clearInterval(this.timer)
        this.timer = setInterval(() => {
          if (this.downTime <= 0) {
            clearInterval(this.timer)
            this.showMovieAd = false
            this.$nextTick(() => {
              this.initDplayer()
            })
          } else {
            this.downTime--
          }
        }, 1000)
      } else {
        this.showMovieAd = false
        this.$nextTick(() => {
          this.initDplayer()
        })
      }
    }
    if (this.isAddView) {
      viewAdd({
        mediaId: this.id,
        mediaType: this.mediaType,
      })
    }
  },
  activated() {
    this.xgPlayer && this.xgPlayer.play()
  },
  deactivated() {
    this.timer && clearInterval(this.timer)
    this.xgPlayer && this.xgPlayer.pause()
  },
  destroyed() {
    this.timer && clearInterval(this.timer)
    this.customTagTimer && clearInterval(this.customTagTimer)
    this.xgPlayer && this.xgPlayer.destroy()
  },
  methods: {
    initDplayer() {
      if (!this.cdnLine) {
        return this.$toast('获取线路失败')
      }
      if (!this.video) {
        return this.$toast('播放源无效地址')
      }
      const videoUrl =
        this.video.indexOf('http') > -1
          ? this.video
          : this.cdnLine.cdnLine + this.video
      const poster =
        this.videoCover.indexOf('http') > -1
          ? this.videoCover
          : this.cdnLine.cdnLine + this.videoCover
      const config = {
        id: this.idName ? this.idName : 'xgplay' + this.id, // 容器
        poster: poster,
        url: videoUrl, // 视频链接
        autoplay: true,
        loop: this.loop,
        height: '200px',
        playsinline: true,
        plugins: window.navigator.standalone === undefined ? [HlsJsPluginJs] : [HlsJsPlugin],
        hls: {
          instance: new Hls({
            debug: false, // 关闭调试日志
            maxBufferLength: 30, // 限制缓冲区大小，避免黑屏
            maxMaxBufferLength: 60,
            liveSyncDurationCount: 3, // 直播同步
            enableWorker: true, // 开启 Web Worker 加速解析
          }),
        },
      }
      if (this.isLive) {
        config['isLive'] = this.isLive
        config['ignores'] = ['play', 'fullscreen']
        config['closeVideoClick'] = true
      }
      if (this.canChangeClarity) {
        config['definitionActive'] = 'click'
      }
      if (this.progressDot && this.progressDot.length) {
        config['progressDot'] = this.progressDot
        this.customTagTimer = setInterval(() => {
          this.customTag(this.progressDot)
        }, 500)
      }
      this.xgPlayer = new XGPlayer(config)
      if ((typeof this.video === 'string' && this.video.includes('.m3u8')) || this.isHls) {
        this.xgPlayer.hls &&
          this.xgPlayer.hls.on('hlsError', (desc, error) => {
            //这里可以监听到网络异常
            if (error.type === 'networkError') {
              this.$emit('networkError')
            }
          })
      }
      this.xgPlayer.once('complete', () => {
        this.$emit('complete')
      })
      this.xgPlayer.on('ended', () => {
        this.$emit('ended')
      })
      this.xgPlayer.on('error', () => {
        this.$emit('error')
      })
      if (this.canChangeClarity && this.streamUrls) {
        const streamUrlsArr = Object.keys(this.streamUrls)
          .filter(key => key !== 'original')
          .map(key => {
            return {
              name: key,
              url: this.streamUrls[key],
            }
          })
        this.xgPlayer.emit('resourceReady', streamUrlsArr)
      }
    },
    closeDownload() {
      if (this.adData.whetherSkip === 0) {
        if (this.userInfo && this.userInfo.vipFlag) {
          this.timer && clearInterval(this.timer)
          this.showMovieAd = false
          // this.xgPlayer.play()
          this.$nextTick(() => {
            this.initDplayer()
          })
        } else {
          this.$toast('请先开通VIP')
        }
      } else {
      }
    },
    async onClickBanner() {
      clickBanner({ bannerCode: this.adData.bannerCode })
      if (this.adData.jumpType === 0) {
        // jumpType = 0 ===> 内链
        if (this.adData.jumpUrl === 'JUMP_LINK_VIP') {
          this.$router.push('/vip')
        } else if (this.adData.jumpUrl === 'CHARGE_LINK_COIN') {
          this.$router.push('/recharge')
        } else if (this.adData.jumpUrl === 'JUMP_LINK_PROXY') {
          this.$router.push('/promote')
        } else if (this.adData.jumpUrl === 'JUMP_LINK_STREAM') {
          this.$router.push('/streaming')
        } else if (this.adData.jumpUrl === 'JUMP_LINK_CHECK') {
          this.$router.push('/signin')
        } else {
          this.$router.push(this.adData.jumpUrl)
        }
      } else if (this.adData.jumpType === 1) {
        // jumpType = 1 ===> 外链
        if (this.isApp) {
          window.open(this.adData.jumpUrl, '_self')
        } else {
          window.open(this.adData.jumpUrl, '_blank')
        }
      } else {
        // jumpType = 3 ===> 不跳
        return null
      }
    },
    customTag(progressDot) {
      const progressDotList = document.getElementsByClassName(
        'xgplayer-progress-dot'
      )
      if (progressDotList.length) {
        this.customTagTimer && clearInterval(this.customTagTimer)
        for (let i = 0; i < progressDotList.length; i++) {
          const targetDom = progressDotList[i].getElementsByClassName(
            'xgplayer-progress-tip'
          )
          if (targetDom[0]) {
            targetDom[0].innerHTML = `<img src='${progressDot[i].image}' style='width: 100px; height: 75px; object-fit: cover;' />`
          }
        }
      }
    },
    reload() {
      this.xgPlayer && this.xgPlayer.reload()
    },
  },
}
</script>

<style lang="less">
.video-player-box {
  width: 100% !important;
  min-height: 200px;
  height: 100% !important;
  position: relative;
}

.xgplay {
  width: 100% !important;
  min-height: 200px;
  height: 100% !important;
}

.movie-ad-box {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1111;
  width: 100%;
  height: 100%;
  background: #000;

  .movie-ad {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .download {
    width: 84px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    border-radius: 16px;
    font-size: 12px;
    background: #0006;
    color: #fff;
    position: absolute;
    bottom: 12px;
    right: 12px;
    cursor: pointer;
  }
}

.water-mark {
  position: absolute;
  right: 12px;
  bottom: 12px;
  color: #dbd6d6;
}
</style>
