<template>
    <div class="side-bar" v-if="videoInfo">
        <div class="bar-item" @click="onLike">
            <img class="icon" :src="videoInfo.hasFavor ? require('@/assets/images/iconMyLike.png') : require('@/assets/images/iconLike.png')">
            <div>{{ formatNum(videoInfo.fakeFavorCount + videoInfo.favorCount) || 0 }}</div>
        </div>
        <div class="bar-item" @click="onComment">
            <img class="icon" src="@/assets/images/iconComment.png">
            <div>{{ formatNum(videoInfo.commentCount) || 0 }}</div>
        </div>
        <div class="bar-item" @click="onShare">
            <img class="icon" src="@/assets/images/icon_share_v2.png">
            <div>分享</div>
        </div>
        <div v-if="cdnLine" class="bar-item" @click="onChangeLine">
            <img class="icon" src="@/assets/images/iconSwitch.png">
            <div>{{ cdnLine.cdnName }}</div>
        </div>
    </div>
</template>

<script>
import { formatStrNum } from '@/utils/tools'
import { favorAdd } from '@/apis/media'
import PubSub from 'pubsub-js'

export default {
    name: 'SideBar',
    props: {
        videoInfo: {
            type: Object,
            default: () => {
                return null
            }
        }
    },
    data() {
        return {}
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        cdnLine() {
            return this.$store.state.cdnLine
        }
    },
    created() {},
    mounted() {},
    methods: {
        formatNum(num) {
            return formatStrNum(num)
        },
        onComment() {
            this.$emit('handleComment', this.videoInfo)
        },
        async onLike() {
            if (!this.userInfo) {
                return this.$toast('请先登录')
            }
            const params = {
                mediaId: this.videoInfo.mediaId,
                favorType: 2
            }
            const res = await favorAdd(params)
            if (res && res.code === 0) {
                const videoData = Object.assign({}, this.videoInfo)
                if (this.videoInfo.hasFavor) {
                    videoData.favorCount -= 1
                } else {
                    videoData.favorCount += 1
                }
                videoData.hasFavor = !this.videoInfo.hasFavor
                this.$emit('handleFavor', videoData)
            }
        },
        onRoute(path) {
            this.$router.push(path)
        },
        onChangeLine() {
            if (this.cdnLineList.length <= 1) {
                this.$toast('没有更多可用线路')
            } else {
                this.$store.commit('CHANGE_CDNLINE')
            }
        },
        onShare() {}
    }
};
</script>

<style lang="less" scoped>
.side-bar {
    position: absolute;
    bottom: 76px;
    right: 16px;
    z-index: 999;
    text-align: center;
    font-size: 12px;
    color: #fff;
    .icon {
        display: inline-block;
        width: 32px;
        height: 32px;
        margin: 0 auto;
    }
    .bar-item {
        margin-top: 24px;
    }
}
</style>