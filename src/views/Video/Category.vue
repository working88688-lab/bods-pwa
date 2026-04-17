<template>
    <div class="player-content">
        <Loading v-if="isInit"/>
        <template v-else>
            <van-swipe ref="videoSwiper" vertical :loop="isLoop" :show-indicators="false" @change="onSwipeChange">
                <van-swipe-item v-if="playVideo0">
                    <div class="video-item" @click="onClickSwiper(0)">
                        <FullScreenPlayer
                            ref="videoPlayer0"
                            :id="playVideo0.mediaId"
                            :mediaType="playVideo0.mediaType"
                            :video="playVideo0.video.videoUrl"
                            :videoCover="playVideo0.video.videoCoverImg"
                            :isAddView="!playVideo0.preview"
                            :isLoop="false"
                            :autoplay="false"
                            @ended="handleEnded"/>
                        <VideoItem :video="playVideo0" @onBuy="handleBuy" @handleComment="onComment" @handleFavor="handleFavor($event,'playVideo0')" />
                    </div>
                </van-swipe-item>
                <van-swipe-item v-if="playVideo1">
                    <div class="video-item" @click="onClickSwiper(1)">
                        <FullScreenPlayer
                            ref="videoPlayer1"
                            :id="playVideo1.mediaId"
                            :mediaType="playVideo1.mediaType"
                            :video="playVideo1.video.videoUrl"
                            :videoCover="playVideo1.video.videoCoverImg"
                            :isAddView="playVideo1.preview"
                            :isLoop="false"
                            :autoplay="false"
                            @ended="handleEnded"/>
                        <VideoItem :video="playVideo1" @onBuy="handleBuy" @handleComment="onComment" @handleFavor="handleFavor($event,'playVideo1')" />
                    </div>
                </van-swipe-item>
                <van-swipe-item v-if="playVideo2">
                    <div class="video-item" @click="onClickSwiper(2)">
                        <FullScreenPlayer
                            ref="videoPlayer2"
                            :id="playVideo2.mediaId"
                            :mediaType="playVideo2.mediaType"
                            :video="playVideo2.video.videoUrl"
                            :videoCover="playVideo2.video.videoCoverImg"
                            :isAddView="playVideo2.preview"
                            :isLoop="false"
                            :autoplay="false"
                            @ended="handleEnded"/>
                        <VideoItem :video="playVideo2" @onBuy="handleBuy" @handleComment="onComment" @handleFavor="handleFavor($event, 'playVideo2')" />
                    </div>
                </van-swipe-item>
            </van-swipe>
        </template>
        <Comment v-if="rowVideo" ref="commentRef" :videoInfo="rowVideo" @addComment="handleAddComment" @close="handleCloseComment"/>
    </div>
</template>
 
<script>
import { listShortVideoRandom, purchase, getMediaById, viewAdd } from '@/apis/media'
import FullScreenPlayer from '@/components/FullScreenPlayer'
import SideBar from './components/SideBar'
import VideoItem from './components/VideoItem'
import _ from 'lodash'
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
import { Dialog } from 'vant'
import Advertise from '@/components/Advertise'
import Loading from '@/components/Loading'
import Comment from '@/components/Comment'

export default {
    name: 'RecommendVideo',
    components: {
        FullScreenPlayer,
        SideBar,
        VideoItem,
        Swiper,
        SwiperSlide,
        Advertise,
        Loading,
        Comment
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
        isApp() {
            return this.$store.state.isApp ? true : false
        }
    },
    data() {
        const _this = this
        return {
            isInit: true,
            videoList: [],
            page: {
                pageSize: 10,
                pageNo: 1
            },
            categoryId: null,
            swiperIndex: 0,
            activedIndex: 0,
            playVideo0: null,
            playVideo1: null,
            playVideo2: null,
            isLoop: false,
            prevIndex: 0,
            rowVideo: null
        }
    },
    created() {
        this.resetData()
        this.getVideoList(true)
    },
    mounted() {},
    activated() {
        this.activatedPlay()
    },
    deactivated() {
        this.deactivatedStop()
    },
    destroyed() {},
    methods: {
        resetData() {
            const { categoryId } = this.$route.query
            if (!categoryId) {
                return this.$toast('获取分类信息失败')
            }
            this.categoryId = categoryId
            this.isInit = true
            this.videoList = []
            this.page.pageNo = 1
        },
        activatedPlay() {
            if (this.$refs['videoPlayer' + this.swiperIndex]) {
                this.$refs['videoPlayer' + this.swiperIndex].play()
            }
        },
        deactivatedStop() {
            if (this.$refs['videoPlayer' + this.swiperIndex]) {
                this.$refs['videoPlayer' + this.swiperIndex].stop()
            }
        },
        onClickSwiper(index) {
            const status = this.$refs['videoPlayer' + index].getPlayStatus()
            if(status) {
                this.$refs['videoPlayer' + index].play()
            } else {
                this.$refs['videoPlayer' + index].stop()
            }
        },
        onSwipeChange(index) {
            this.swiperIndex = index
            let direction = ''
            if (index === 0 && this.prevIndex === 2) {
                direction = 'toTop'
                this.activedIndex++
                this.onNextVideo(index)
            } else if (index === 2 && this.prevIndex === 0) {
                direction = 'toBottom'
                this.activedIndex--
                this.onPrevVideo(index)
            } else {
                if (index > this.prevIndex) {
                    direction = 'toTop'
                    this.activedIndex++
                    this.onNextVideo(index)
                } else {
                    direction = 'toBottom'
                    this.activedIndex--
                    this.onPrevVideo(index)
                }
            }
            this.prevIndex = index
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
            if (this.videoList[this.activedIndex]) {
                viewAdd({
                    mediaId: this.videoList[this.activedIndex].mediaId,
                    mediaType: this.videoList[this.activedIndex].mediaType
                })
            }
            if (this.activedIndex === 0 || this.activedIndex === this.videoList.length) {
                this.isLoop = false
            } else {
                this.isLoop = true
            }
        },
        // 上滑
        onNextVideo(index) {
            if (this.$refs['videoPlayer' + (index - 1)]) {
                this.$refs['videoPlayer' + (index - 1)].stop()
            }
            if (this.$refs['videoPlayer' + index]) {
                this.$refs['videoPlayer' + index].play()
            }
            if (this.videoList.length - this.activedIndex <= 5) {
                this.getVideoList(false)
            }
        },
        // 下滑
        onPrevVideo(index) {
            if (this.$refs['videoPlayer' + (index + 1)]) {
                this.$refs['videoPlayer' + (index + 1)].stop()
            }
            if (this.$refs['videoPlayer' + index]) {
                this.$refs['videoPlayer' + index].play()
            }
        },
        async getVideoList(isRefresh) {
            const menuData = this.appFooter.find(one => one.expand === '/video')
            if (!menuData) {
                this.isInit = false
                return this.$toast('获取分类信息失败')
            }
            const targetData = menuData.child.find(one => one.categoryId === this.categoryId)
            if (!targetData || !targetData.child || !targetData.child[0]) {
                this.isInit = false
                return this.$toast('获取分类信息失败')
            }
            const res = await listShortVideoRandom({
                ...this.page,
                mediaType: 2,
                categoryId: targetData.child[0].categoryId
            }).catch(() => {
                this.isInit = false
            })
            this.isInit = false
            if(res && res.code === 0) {
                if (isRefresh) {
                    this.videoList = res.data.dataList
                } else {
                    this.videoList = this.videoList.concat(res.data.dataList)
                }
                this.videoList = this.videoList.map((one, index) => {
                    return {
                        index,
                        ...one
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
                    if (this.playVideo0) {
                        viewAdd({
                            mediaId: this.playVideo0.mediaId,
                            mediaType: this.playVideo0.mediaType
                        })
                    }
                }
            }
        },
        onSearch(label) {
            this.$router.push({
                path: '/search',
                query: {
                    label: label.tagName,
                    mediaType: 22
                }
            })
        },
        onRoute(path){
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
                className: 'confirm-dialog'
            }).then(async () => {
                const params = {
                    mediaId: data.mediaId,
                    mediaType: data.mediaType
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
                    const idx = _.findIndex(this.videoList, one => one.mediaId === data.mediaId)
                    this.handleSuccess(data, idx)
                }
            }).catch(() => {})
        },
        async handleSuccess(data, idx) {
            const params = {
                mediaId: data.mediaId,
                mediaType: data.mediaType
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
                            className: 'confirm-dialog'
                        }).then(async () => {
                            this.onRoute('/login')
                        }).catch(() => {})
                    } else if (this.userInfo.coinBalance < activedVideo.goldPayUnit) {
                        Dialog.confirm({
                            title: '提示',
                            message: `试看结束，充值金币解锁完整视频`,
                            className: 'confirm-dialog'
                        }).then(async () => {
                            this.onRoute('/recharge')
                        }).catch(() => {})
                    } else {
                        Dialog.confirm({
                            title: '提示',
                            message: `试看结束，是否花费${activedVideo.goldPayUnit}金币购买完整视频？`,
                            className: 'confirm-dialog'
                        }).then(async () => {
                            const params = {
                                mediaId: activedVideo.mediaId,
                                mediaType: activedVideo.mediaType
                            }
                            this.loading = true
                            const res = await purchase(params).catch(() => {
                                this.loading = false
                            })
                            this.loading = false
                            if (res && res.code === 0) {
                                const userData = Object.assign({}, this.userInfo)
                                userData.coinBalance = userData.coinBalance - activedVideo.goldPayUnit
                                this.$store.commit('SET_USERINFO', userData)
                                this.$toast('购买成功')
                                const targetIdx = _.findIndex(this.videoList, one => one.mediaId === activedVideo.mediaId)
                                this.handleSuccess(activedVideo, targetIdx)
                            }
                        }).catch(() => {})
                    }
                } else if (activedVideo.payType === 3) {
                    Dialog.confirm({
                        title: '提示',
                        message: `试看结束，提升等级解锁完整视频`,
                        className: 'confirm-dialog'
                    }).then(async () => {
                        this.onRoute('/vip')
                    }).catch(() => {})
                } else if (activedVideo.payType === 4) {
                    Dialog.confirm({
                        title: '提示',
                        message: `试看结束，开通VIP解锁完整视频`,
                        className: 'confirm-dialog'
                    }).then(async () => {
                        this.onRoute('/vip')
                    }).catch(() => {})
                }
            }
            
        },
        handleFavor(data, filed) {
            this.$set(this.videoList, this.activedIndex, data)
            this[filed] = data
        },
        onComment(data) {
            this.rowVideo = data
            this.$nextTick(() => {
                this.$refs.commentRef.onShowComment()
            })
        },
        handleAddComment() {
            this.rowVideo.commentCount = this.videoInfo.commentCount + 1
            this.$set(this.videoList, this.activedIndex, this.rowVideo)
        },
        handleCloseComment() {},
    }
};
</script>

<style lang="less" scoped>
.player-content {
    width: 100%;
    height: 100%;
    position: relative;
}
::v-deep .van-swipe {
    width: 100%;
    height: 100%;
    position: relative;
}
.video-item {
    height: 100%;
    width: 100%;
    overflow: hidden;
    .cover-img {
        width: 100%;
        height: 100%;
        background-color: #222;
        object-fit: cover;
    }
    .video-info {
        position: absolute;
        left: 16px;
        bottom: 42px;
        z-index: 999;
        color: #fff;
        font-size: 16px;
        .preview-tip {
            display: inline-block;
            padding: 0 16px;
            height: 32px;
            line-height: 32px;
            border-radius: 16px;
            background: linear-gradient(to right,#ffe08d, #fea94e);
            font-size: 14px;
            color: #743b00;
        }
        .up-name {
            font-size: 16px;
            font-weight: bold;
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
                background: #7556fa;
                font-size: 12px;
                color: #fff;
                border-radius: 13px;
                margin: 6px 12px 0 0;
            }
        }
    }
}
</style>
