<template>
    <div class="page-container">
        <Header textColor="#fff" @onClickLeft="onBack" />
        <div class="page-content" v-if="videoInfo">
            <FullScreenPlayer :id="videoInfo.videoId" :video="videoInfo.videoUrl" />
        </div>
    </div>
</template>
  
<script>
import Header from '@/components/Header'
import FullScreenPlayer from '@/components/FullScreenPlayer'

export default {
    name: 'VideoPlayer',
    components: { Header, FullScreenPlayer },
    data() {
        return {
            videoInfo: null
        }
    },
    watch: {
        '$route.query.videoInfo': {
            handler(newval) {
                if(newval) {
                    this.videoInfo = null
                    setTimeout(() => {
                        this.videoInfo = JSON.parse(decodeURI(this.$route.query.videoInfo))
                    }, 100)
                }
            }
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        }
    },
    created () {
        if (this.$route.query.videoInfo) {
            this.videoInfo = JSON.parse(decodeURI(this.$route.query.videoInfo))
        } else {
            this.$router.push('/square')
        }
    },
    mounted() {},
    methods: {
        onBack() {
            this.$router.go(-1)
        }
    }
};
</script>
  
<style lang="less" scoped>
.page-content {
    height: 100vh;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    .video-info {
        position: absolute;
        left: 16px;
        bottom: 64px;
        z-index: 99;
        color: #fff;
        font-size: 16px;
        .preview-tip {
            display: inline-block;
            padding: 0 16px;
            height: 32px;
            line-height: 32px;
            border-radius: 16px;
            background: linear-gradient(to right,rgb(240, 210, 138), rgb(214, 137, 69));
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
                padding: 3px 10px;
                border: 1px solid #d92514;
                font-size: 12px;
                color: #d92514;
                border-radius: 13px;
                margin: 6px 12px 0 0;
            }
        }
    }
}
</style>