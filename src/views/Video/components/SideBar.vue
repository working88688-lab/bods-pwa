<template>
    <div class="side-bar" v-if="videoInfo">
        <div class="bar-item">
            <img class="icon" :src="videoInfo.hasFavor ? require('@/assets/images/iconMyLike.png') : require('@/assets/images/iconLike.png')" @click="onLike($event)">
            <div>{{ formatNum(videoInfo.fakeFavorCount + videoInfo.favorCount) || 0 }}</div>
        </div>
        <div class="bar-item">
            <img class="icon" src="@/assets/images/iconComment.png" @click="onComment($event)">
            <div>{{ formatNum(videoInfo.commentCount) || 0 }}</div>
        </div>
        <div class="bar-item" @click="onRoute('/promote', $event)">
            <img class="icon" src="@/assets/images/icon_share_v2.png">
            <div>赚会员</div>
        </div>
        <div v-if="cdnLine" class="bar-item" @click="onChangeLine($event)">
            <img class="icon" src="@/assets/images/iconSwitch.png">
            <div>{{ cdnLine.cdnName }}</div>
        </div>
    </div>
</template>

<script>
import { formatStrNum } from '@/utils/tools'
import { favorAdd } from '@/apis/media'

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
        },
        cdnLineList() {
            return this.$store.state.cdnLineList
        }
    },
    created() {},
    mounted() {},
    methods: {
        formatNum(num) {
            return formatStrNum(num)
        },
        onComment(event) {
            if (event && event.stopPropagation) {
                event.stopPropagation()
            } else {
                window.event.cancelBubble = true
            }
            this.$emit('handleComment', this.videoInfo)
        },
        async onLike(event) {
            if (event && event.stopPropagation) {
                event.stopPropagation()
            } else {
                window.event.cancelBubble = true
            }
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
                    videoData.videoInfo -= 1
                } else {
                    videoData.videoInfo += 1
                }
                videoData.hasFavor = !this.videoInfo.hasFavor
                this.$emit('handleFavor', videoData)
            }
        },
        onRoute(path, event) {
            if (event && event.stopPropagation) {
                event.stopPropagation()
            } else {
                window.event.cancelBubble = true
            }
            this.$router.push(path)
        },
        onChangeLine(event) {
            if (event && event.stopPropagation) {
                event.stopPropagation()
            } else {
                window.event.cancelBubble = true
            }
            if (this.cdnLineList.length <= 1) {
                this.$toast('没有更多可用线路')
            } else {
                this.$store.commit('CHANGE_CDNLINE')
            }
        },
    }
};
</script>

<style lang="less" scoped>
.side-bar {
    width: 56px;
    position: absolute;
    bottom: 42px;
    right: 10px;
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