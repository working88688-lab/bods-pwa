<template>
    <div class="FullScreenPlayer" :id="'FullScreen' + id" @dblclick="handleDblclick"></div>
</template>

<script>
import _ from 'lodash'
import { viewAdd } from '@/apis/media'
import XGPlayer from "xgplayer"
import HlsJsPlugin from 'xgplayer-hls'
import HlsJsPluginJs from 'xgplayer-hls.js'
import Hls from 'hls.js'

export default {
    name: 'FullScreenPlayer',
    props: {
        id: {
            type: String,
            default: "",
        },
        height: {
            type: [String, Number],
            default: "100%",
        },
        mediaType: {
            type: Number,
            default: 1,
        },
        video: {
            type: String,
            default: "",
        },
        videoCover: {
            type: String,
            default: "",
        },
        autoplay: {
            type: Boolean,
            default: true,
        },
        isLoop: {
            type: Boolean,
            default: true,
        },
        isAdvertise: {
            type: Boolean,
            default: false,
        },
        isAddView: {
            type: Boolean,
            default: true,
        }
    },
    watch: {
        height: {
            handler(val) {
                if (val) {
                    if (this.xgPlayer) {
                        this.xgPlayer.destroy()
                    }
                    this.$nextTick(() => {
                        this.initDplayer()
                    })
                }
            }
        },
        video: {
            handler(val) {
                if (val) {
                    if (this.xgPlayer) {
                        this.xgPlayer.replay()
                        this.xgPlayer.src = this.cdnLine.cdnLine + val
                        this.xgPlayer.config.url = this.cdnLine.cdnLine + val
                    }
                }
                if (this.isAdvertise) {
                    this.xgPlayer && this.xgPlayer.pause()
                }
            }
        }
    },
    data() {
        return {
            xgPlayer: null
        }
    },
    computed: {
        cdnLine() {
            return this.$store.state.cdnLine
        }
    },
    created() {
        this.$nextTick(() => {
            this.initDplayer()
        })
    },
    activated() {

    },
    destroyed() {
        this.xgPlayer && this.xgPlayer.destroy()
    },
    methods: {
        initDplayer() {
            const _this = this
            if (!this.cdnLine) {
                return this.$toast('获取线路失败')
            }
            if (!this.video) {
                return this.$toast('播放源无效地址')
            }
            const videoUrl = this.video.indexOf('http') > -1 ? this.video : (this.cdnLine.cdnLine + this.video)
            const poster = this.videoCover.indexOf('http') > -1 ? this.videoCover : (this.cdnLine.cdnLine + this.videoCover)
            if (typeof this.video === 'string' && this.video.includes('.m3u8')) {
                this.xgPlayer = new XGPlayer({
                    id: "FullScreen" + this.id, // 容器
                    height: this.height,
                    hlsOpts: {
                        maxBufferLength: 5, //最大缓冲时长，单位秒
                    },
                    crossOrigin: true,
                    url: videoUrl, // 视频链接
                    poster: poster, // 封面
                    autoplay: this.autoplay,
                    loop: this.isLoop,
                    playsinline: true,
                    closeVideoStopPropagation: false,
                    ignores: ['play', 'fullscreen'],
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
                })
            } else {
                this.xgPlayer = new XGPlayer({
                    id: "FullScreen" + this.id, // 容器
                    height: this.height,
                    crossOrigin: true,
                    url: videoUrl, // 视频链接
                    poster: poster,
                    autoplay: this.autoplay,
                    loop: this.isLoop,
                    playsinline: true,
                    closeVideoStopPropagation: false,
                    ignores: ['play', 'fullscreen']
                })
            }
            this.xgPlayer.on('ready', () => {
                if (this.isAddView) {
                    viewAdd({
                        mediaId: _this.id,
                        mediaType: this.mediaType
                    })
                }
            })
            this.xgPlayer.on('ended', () => {
                this.$emit('ended')
            })
            this.xgPlayer.on('canplay', () => {
                this.$emit('canplay')
            })
            this.xgPlayer.on('error', () => {
                this.$emit('error')
            })
        },
        handleDblclick() {
            console.log('===============双击=================')
        },
        stop() {
            if (this.xgPlayer) {
                this.xgPlayer.pause()
            }
        },
        start() {
            if (this.xgPlayer) {
                this.xgPlayer.play()
            }
        },
        getPlayStatus() {
            if (this.xgPlayer) {
                return this.xgPlayer.paused
            } else {
                return false
            }
        }
    }
};
</script>

<style lang="less">
.FullScreenPlayer {
    width: 100% !important;
    height: 100% !important;

    video {
        width: 100% !important;
        height: 100% !important;
    }
}
</style>