<template>
    <div v-if="video">
        <div class="video-info">
            <div class="preview-tip" v-if="video.preview">
                <div v-if="video.payType === 2" @click="onBuy($event, video)">预览10秒 金币购买看完整视频</div>
                <div v-if="video.payType === 3" @click="onRoute('/vip')">预览10秒 用户等级{{ video.userLevel }}看完整视频</div>
                <div v-if="video.payType === 4" @click="onRoute('/vip')">预览10秒 充VIP看完整视频</div>
            </div>
            <div class="video-name">{{ video.video.videoTitle }}</div>
            <div class="video-labels">
                <span class="label-item" v-for="(label, m) in video.tagList" :key="m"
                    @click="onSearch($event, label)">{{ label.tagName }}</span>
            </div>
        </div>
        <SideBar :videoInfo="video" @handleFavor="handleFavor" @handleComment="handleComment" />
    </div>
</template>

<script>
import SideBar from './SideBar'
import _ from 'lodash'

export default {
    name: 'RecommendVideo',
    components: {
        SideBar
    },
    props: {
        video: {
            type: Object,
            default: null
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
    data() {
        const _this = this
        return {
            isInit: true,
            contentHeight: (window.innerHeight - 55) + 'px',
            activedIdx: 0,
            videoList: [],
            page: {
                pageSize: 10,
                pageNo: 1
            },
            showComment: false,
            activedVideo: null,
            bannerList: [],
            adIndex: 0,
            isCanplay: false
        }
    },
    created() { },
    mounted() { },
    activated() { },
    methods: {
        handleFavor(data) {
            this.$emit('handleFavor', data)
        },
        handleComment(data) {
            this.$emit('handleComment', data)
        },
        onRoute(path) {
            this.$router.push(path)
        },
        async onSearch(event, label) {
            if (event && event.stopPropagation) {
                event.stopPropagation()
            } else {
                window.event.cancelBubble = true
            }
            this.$router.push({
                path: '/search',
                query: {
                    label: label.tagName,
                    mediaType: 2
                }
            })
        },
        onBuy(event) {
            if (event && event.stopPropagation) {
                event.stopPropagation()
            } else {
                window.event.cancelBubble = true
            }
            this.$emit('onBuy', this.video)
        }
    }
};
</script>

<style lang="less" scoped>
.video-info {
    position: absolute;
    left: 16px;
    bottom: 55px;
    z-index: 999;
    color: #fff;
    font-size: 16px;

    .preview-tip {
        display: inline-block;
        padding: 0 16px;
        height: 32px;
        line-height: 32px;
        border-radius: 16px;
        background: #00000066;
        font-size: 14px;
        color: #fff;
    }

    .video-name {
        width: 280px;
        margin: 12px 0;
        font-size: 14px;
    }

    .video-labels {
        width: 280px;
        display: flex;
        flex-flow: wrap;
        margin: 12px 0 0;

        .label-item {
            padding: 3px 10px;
            background: #d92514;
            font-size: 12px;
            color: #fff;
            border-radius: 13px;
            margin: 6px 12px 0 0;
        }
    }
}
</style>
