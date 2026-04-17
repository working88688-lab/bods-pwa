<template>
    <div class="FullScreenPlayer" :id="id"></div>
</template>

<script>
import _ from 'lodash'
import XGPlayer from "xgplayer"

export default {
    name: 'StartVideo',
    data() {
        return {
            id: 'start-video',
            xgPlayer: null
        }
    },
    created() {
        this.$nextTick(() => {
            this.initDplayer()
        })
    },
    activated() {},
    destroyed() {
        this.xgPlayer && this.xgPlayer.destroy()
    },
    methods: {
        initDplayer() {
            this.xgPlayer = new XGPlayer({
                id: this.id, // 容器
                crossOrigin: true,
                url: require('./img_splash.mp4'), // 视频链接
                autoplay: true,
                autoplayMuted: true,
                loop: false,
                playsinline: true,
                closeVideoStopPropagation: false,
                controls: false,
                ignores: ['start', 'replay']
            })
            this.xgPlayer.on('ended',()=>{
                this.$emit('ended')
            })
        }
    }
};
</script>

<style lang="less">
.FullScreenPlayer {
    width: 100%!important;
    height: 100%!important;
    video {
        width: 100%!important;
        height: 100%!important;
        object-fit: cover;
    }
}
</style>