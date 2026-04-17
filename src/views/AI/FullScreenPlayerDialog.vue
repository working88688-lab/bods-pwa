<template>
    <van-popup v-model:show="showDialog" :style="{ height: '100%', width: '100%' }">
        <div class="popup-header">
            <van-icon name="close" @click="onClose" />
        </div>
        <div class="player-box">
            <div class="FullScreenPlayer" :id="'FullScreen' + id"></div>
        </div>
    </van-popup>
</template>

<script>
import _ from 'lodash'
import XGPlayer from "xgplayer"
import HlsJsPlugin from 'xgplayer-hls'
import HlsJsPluginJs from 'xgplayer-hls.js'
import Hls from 'hls.js'
import Loading from '@/components/Loading'

export default {
    name: 'FullScreenPlayerDialog.vue',
    components: {
        Loading
    },
    props: {
        id: {
            type: [Number, String],
            default: null,
        },
        videoUrl: {
            type: String,
            default: "",
        }
    },
    computed: {
        cdnLine() {
            return this.$store.state.cdnLine
        }
    },
    data() {
        return {
            showDialog: true
        }
    },
    async created() {
        this.$nextTick(() => {
            this.initDplayer()
        })
    },
    destroyed() {
        this.xgPlayer && this.xgPlayer.destroy()
    },
    methods: {
        onClose() {
            this.$emit('closePlay')
        },
        initDplayer() {
            if (typeof this.videoUrl === 'string' && this.videoUrl.includes('.m3u8')) {
                this.xgPlayer = new XGPlayer({
                    id: "FullScreen" + this.id, // 容器
                    hlsOpts: {
                        maxBufferLength: 5, //最大缓冲时长，单位秒
                    },
                    crossOrigin: true,
                    url: this.videoUrl, // 视频链接
                    autoplay: true,
                    videoInit: true,
                    loop: false,
                    playsinline: true,
                    closeVideoStopPropagation: false,
                    closeVideoClick: true,
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
                    crossOrigin: true,
                    url: this.videoUrl, // 视频链接
                    autoplay: true,
                    videoInit: true,
                    loop: false,
                    playsinline: true,
                    closeVideoStopPropagation: false
                })
            }
        }
    }
}
</script>

<style lang="less" scoped>
.van-popup {
    background-color: #000;
    width: 100%;
    padding: 0;
    left: 50%;
    display: flex;
    align-items: center;
    flex-direction: column;

    .popup-header {
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 999;
        text-align: right;
        padding: 12px;

        i {
            color: #fff;
            font-size: 32px;
        }
    }

    .player-box {
        width: 100%;
        min-height: 320px;
        flex: 1;
        overflow: hidden;
        position: relative;

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

    }

    .video-info {
        width: 100%;
        height: 500px;
        overflow: auto;

        .episode-list {
            width: 100%;
            display: flex;
            justify-content: flex-start;
            flex-wrap: wrap;
            padding: 12px;

            .episode-item {
                width: calc((100% - 36px) / 4);
                border: 1px solid #7556fa;
                color: #7556fa;
                margin-right: 12px;
                margin-bottom: 12px;
                padding: 4px 8px;
                border-radius: 5px;
                text-align: center;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            .episode-item:nth-child(4n) {
                margin-right: 0;
            }

            .actived {
                background: #7556fa;
                color: #fff;
            }
        }

        .video-data {
            padding: 0 12px 12px;

            >div {
                margin-bottom: 8px;
            }
        }
    }
}

.FullScreenPlayer {
    width: 100% !important;
    height: 100% !important;

    video {
        width: 100% !important;
        height: 100% !important;
    }
}
</style>
