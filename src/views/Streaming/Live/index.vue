<template>
    <div class="page-container" :class="{ 'is-horizontal': isHorizontal }" :style="{ height: height }">
        <LiveHeader :actorInfo="actorInfo" @onClose="onBack" @updateInfo="handleUpdateInfo" />
        <div class="page-content">
            <Loading v-if="isInit" />
            <template v-else>
                <div class="empty-box" v-if="!actorInfo">
                    <van-empty
                        :image="require('@/assets/images/emptyImage.png')"
                        image-size="120"
                        description="暂无数据哦~"
                    />
                </div>
                <template v-else>
                    <div class="live-screen" :style="{ height: height }" :class="{ 'moble-screen': actorInfo.anchor.broadcastMobile }" v-sticky="{ zIndex: 0, stickyTop: 0, disabled: false }">
                        <template v-if="showLivePlayer && actorInfo.anchor.isOnline">
                            <VideoPlayer
                                v-if="actorInfo.anchor.streamUrl"
                                ref="livePlayerRef"
                                :isLive="true"
                                :id="actorInfo.anchor.mediaId"
                                :mediaType="actorInfo.mediaType"
                                :video="actorInfo.anchor.streamUrl"
                                :videoCover="actorInfo.anchor.previewUrl"
                                :isLoop="false"
                                :canChangeClarity="true"
                                :streamUrls="actorInfo.anchor.streamUrls"
                                @complete="handelBuy"
                                @networkError="handleEnded"
                                @ended="handleEnded"
                                @error="handleEnded"/>
                            <div class="live-in" v-else
                                :style="{ 'background-image': 'url('+ (actorInfo.liveImage && actorInfo.liveImage.indexOf('http') > -1 
                                ? actorInfo.liveImage
                                : (imageBase + actorInfo.liveImage)) +')'}">
                                <div>
                                    <div class="live-tip">直播中...</div>
                                    <van-button round type="primary" class="btn-coin" @click="handelBuy">付费观看</van-button>
                                </div>
                            </div>
                        </template>
                        <div v-else class="live-off"
                            :style="{ 'background-image': 'url('+ (actorInfo.anchor.avatarUrl && actorInfo.anchor.avatarUrl.indexOf('http') > -1 
                            ? actorInfo.anchor.avatarUrl
                            : (imageBase + actorInfo.anchor.avatarUrl)) +')'}"
                        >
                            <div>
                                <div class="actor-info">
                                    <div class="actor-avatar">
                                        <img class="avatar"
                                            :src="actorInfo.anchor.avatarUrl && actorInfo.anchor.avatarUrl.indexOf('http') > -1
                                            ? actorInfo.anchor.avatarUrl
                                            : (imageBase + actorInfo.anchor.avatarUrl)">
                                        <div>离线</div>
                                    </div>
                                </div>
                                <div class="off-text" v-if="actorInfo.anchor.offlineStatus">{{ actorInfo.anchor.offlineStatus }}</div>
                                <div class="live-time" v-if="actorInfo.anchor.schedule && actorInfo.anchor.schedule.length">
                                    <div>直播时间</div>
                                    <div>
                                        <span v-for="(item, idx) in actorInfo.anchor.schedule" :key="idx">{{ item.day + ' '+ item.time }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- <div class="banner-wraper" v-if="showBanner">
                        <Banner location="live_page" radius="12px" @onFinish="handleBannerFinish"/>
                    </div>
                    <div class="recommend">
                        <div class="recommend-title">推荐主播</div>
                        <div class="recommend-row">
                            <LiveItem v-for="(data, idx) in recommendList" :liveInfo="data" :key="idx" @onPlay="handlePlay" />
                        </div> 
                    </div> -->
                    <div class="share-box" @click="onShare">
                        <img src="@/assets/images/icon_share_v3.png">
                    </div>
                </template>
            </template>
        </div>
        <feeDialog ref="feeDialogRef" @onConfirm="handleConfirm"/>
        <MessageList ref="MessageListRef" :roomInfo="roomInfo" :isHorizontal="isHorizontal" />
        <ChatInput :actorInfo="actorInfo" :roomInfo="roomInfo" :isHorizontal="isHorizontal" />
    </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import LiveItem from '@/components/LiveItem'
import { getMediaById, listMediaBySearchType, anchorPurchase } from '@/apis/media'
import { joinRoom } from '@/apis/chat'
import { formatStrNum, formatDuration } from '@/utils/tools'
import _ from 'lodash'
import Banner from '@/components/Banner'
import { Dialog } from 'vant'
import Comment from '@/components/Comment'
import VideoPlayer from '@/components/VideoPlayer'
import LiveHeader from './LiveHeader'
import ChatInput from './ChatInput'
import feeDialog from '../components/feeDialog'
import MessageList from './MessageList'
import PubSub from 'pubsub-js'

export default {
    name: 'AnchorLike',
    components: {
        Header,
        Loading,
        LiveItem,
        Banner,
        Comment,
        VideoPlayer,
        LiveHeader,
        feeDialog,
        ChatInput,
        MessageList
    },
    data() {
        return {
            isInit: true,
            actorId: '',
            actorInfo: null,
            isLoading: false,
            showLivePlayer: true,
            weeklyMap: {
                thu: '周一',
                tue: '周二',
                wed: '周三',
                sat: '周四',
                fri: '周五',
                mon: '周六',
                sun: '周日'
            },
            showBanner: true,
            recommendList: [],
            height: window.innerHeight + 'px',
            isHorizontal: false,
            roomInfo: {}
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        },
        token() {
            return this.$store.state.token
        }
    },
    created() {
        window.addEventListener("orientationchange", this.orientationChange)
    },
    async activated() {
        if (!this.$route.query.actorId) {
            return this.$router.push('/streaming')
        } else {
            if (this.$store.state.previousRoute !== '/liveDetail' || this.isInit) {
                this.isInit = true
                this.actorInfo = null
                this.showLivePlayer = true
                this.$refs.MessageListRef && this.$refs.MessageListRef.clearMessage()
                this.getAnchorDetail()
                // this.getRecommendList()
            }
        }
        this.orientationChange()
    },
    destroyed() {
        window.removeEventListener('orientationchange', this.orientationChange)
    },
    methods: {
        orientationChange() {
            if (window.orientation == 180 || window.orientation == 0) {
                this.isHorizontal = false
            }
            if (window.orientation == 90 || window.orientation == -90 ){
                this.isHorizontal = true
            }
            setTimeout(() => {
                this.height = window.innerHeight + 'px'
            }, 200)
        },
        onBack() {
            this.isInit = true
            this.actorInfo = null
            this.$router.push('/streaming')
        },
        async getAnchorDetail() {
            this.actorId = this.$route.query.actorId
            if(!this.actorId) {
                return this.$router.push('/streaming')
            }

            const params = {
                mediaId: this.actorId,
                mediaType: 7
            }
            const res = await getMediaById(params).catch(() => {
                this.isInit = false
            })
            this.isInit = false
            if (res && res.code === 0) {
                this.actorInfo = res.data
                if (this.actorInfo.anchor && this.actorInfo.anchor.schedule) {
                    const liveTime = JSON.parse(this.actorInfo.anchor.schedule)
                    this.actorInfo.anchor.schedule = []
                    for(let key in liveTime) {
                        let obj = {
                            day: this.weeklyMap[key],
                            time: liveTime[key][0]
                        }
                        this.actorInfo.anchor.schedule.push(obj)
                    }
                    this.actorInfo['liveImage'] = this.actorInfo.anchor.previewUrl || this.actorInfo.anchor.previewUrlThumbBig || this.actorInfo.anchor.previewUrlThumbSmall || this.actorInfo.anchor.avatarUrl
                }
                this.actorInfo.anchor.streamUrls = (this.actorInfo.anchor.streamUrls ? JSON.parse(this.actorInfo.anchor.streamUrls) : null)
                if (this.actorInfo.preview && this.actorInfo.anchor.isOnline) {
                    this.handelBuy()
                }
                // 请求加入房间
                this.handleJoinRoom()
            }
        },
        async handleJoinRoom() {
            if(!this.actorInfo) {
                return null
            }
            const res = await joinRoom({
                merchantAcct: this.actorInfo.merchantAcct,
                roomType: 1,
                roomId: this.actorInfo.mediaId
            })
            if (res && res.code === 0) {
                const {  merchantAcct, roomId, dialogueType, dialogueId } = res.data
                this.roomInfo = {
                    merchantAcct,
                    roomId,
                    dialogueType,
                    dialogueId,
                    mediaId: this.actorInfo.mediaId
                }
            }
            this.$store.ws.send(
                JSON.stringify(
                    { 
                        commandType: 'JOIN_ROOM_REQ',
                        sentTime: null,
                        data: {
                            merchantAcct: this.actorInfo.merchantAcct,
                            roomId: this.actorInfo.mediaId,
                            roomType: 1
                        }
                })
            )
        },
        formatNum(num) {
            return formatStrNum(num)
        },
        formatDurationStr(num) {
            return formatDuration(num)
        },
        handleEnded() {
            this.showLivePlayer = false
        },
        handleBannerFinish(data) {
            this.showBanner = !!data.length
        },
        async getRecommendList() {
            const res = await listMediaBySearchType({
                pageNo: 1,
                pageSize: 10,
                mediaType: 7,
                searchType: 'RECOMMEND',
                isLive: 1,
                merchantAcct: process.env.VUE_APP_MERCHANTACCT
            })
            if (res && res.code === 0) {
                this.recommendList = res.data.dataList.map(one => {
                    one['liveImage'] = one.anchor.previewUrl || one.anchor.previewUrlThumbBig || one.anchor.previewUrlThumbSmall || one.anchor.avatarUrl
                    return one
                })
            }
        },
        handelBuy() {
            if (this.actorInfo.preview) {
                if(this.actorInfo.payType === 2) {
                    if (this.userInfo.coinBalance < this.actorInfo.goldPayUnit) {
                        return this.$refs.feeDialogRef.onShow({ type: 'coin', title: '付费解锁', message: '余额不足，是否立即充值', btnText: '充值金币' })
                    } else {
                        return this.$refs.feeDialogRef.onShow({ type: 'live', title: '付费解锁', message: '是否花费' + this.actorInfo.goldPayUnit + '金币观看直播？', tip: '（当天不会再次扣费）', btnText: '确定', data: this.actorInfo })
                    }
                } else if (this.actorInfo.payType === 3) {
                    if (this.userInfo.expLevel < this.actorInfo.userLevel) {
                        return this.$refs.feeDialogRef.onShow({ type: 'level', title: '等级不够', message: '需要达到' + this.actorInfo.userLevel + '才能观看', btnText: '快速提升' })
                    }
                } else if (this.actorInfo.payType === 4) {
                    if (!this.userInfo.vipFlag) {
                        return this.$refs.feeDialogRef.onShow({ type: 'vip', title: '开通会员', message: '请先开通VIP后继续观看', btnText: '购买VIP' })
                    }
                }
            }
        },
        handlePlay(actorInfo) {
            this.$router.push({
                path: '/live',
                query: {
                    actorId: actorInfo.mediaId
                }
            })
        },
        async handleConfirm(data) {
            const res = await anchorPurchase({
                merchantAcct: data.mediaType,
                mediaId: data.mediaId,
                type: 1
            })
            if (res && res.code === 0) {
                // 扣除金币
                const userData = Object.assign({}, this.userInfo)
                userData.coinBalance = userData.coinBalance - data.goldPayUnit
                this.$store.commit('SET_USERINFO', userData)
                // 重新获取直播间信息
                this.getAnchorDetail()
            }
        },
        handleUpdateInfo(data) {
            this.actorInfo = data
        },
        onShare() {}
    }
}
</script>
  
<style lang="less" scoped>
.page-container {
    background: #1d1d28;
    color: #ebebeb;
}
.page-content {
    overflow: hidden;
    box-sizing: border-box;
    position: relative;
    z-index: 0;
}
.live-screen {
    width: 100%;
    background: #000;
    .live-in,
    .live-off {
        width: 100%;
        height: 100%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        background-size: 100%;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;
        >div {
            padding: 16px;
            text-align: center;
            position: relative;
            z-index: 1;
            .actor-info {
                display: inline-flex;
                align-items: center;
                .actor-avatar {
                    width: 40px;
                    height: 40px;
                    position: relative;
                    text-align: center;
                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        border-radius: 50%;
                        overflow: hidden;
                    }
                    >div {
                        width: 36px;
                        height: 16px;
                        line-height: 16px;
                        border-radius: 8px;
                        position: absolute;
                        left: 2px;
                        bottom: 0;
                        font-size: 10px;
                        background: #252633;
                    }
                }
            }
            .off-text {
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                margin-top: 12px;
            }
            .live-time {
                margin-top: 12px;
                span {
                    display: inline-block;
                    margin: 6px 6px 0;
                    white-space: nowrap;
                    font-size: 12px;
                }
            }
        }
    }
    .live-off::after {
        content: '';
        width: 100%;
        height: 100%;
        background: #00000080;
        position: absolute;
        left: 0;
        top: 0;
    }
    .live-tip {
        margin-bottom: 12px;
    }
}
.live-screen.moble-screen {
    // height: 560px;
}
.recommend {
    margin: 16px 12px 0;
    .recommend-title {
        margin-bottom: 12px;
    }
    .recommend-row {
        display: flex;
        flex-flow: wrap;
    }
}
.share-box {
    width: 32px;
    height: 32px;
    position: absolute;
    right: 16px;
    top: calc((100% - 24px) / 2);
    z-index: 1001;
    img {
        width: 100%;
    }
}
.page-container.is-horizontal {
    .live-screen {
        .live-in,
        .live-off {
            >div {
                padding: 8px;
                .btn-coin {
                    height: 20px;
                    line-height: 20px;
                    font-size: 8px;
                    padding: 3px 6px;
                }
                .actor-info {
                    .actor-avatar {
                        width: 20px;
                        height: 20px;
                        >div {
                            width: 18px;
                            height: 8px;
                            line-height: 8px;
                            border-radius: 4px;
                            left: 1px;
                            bottom: 0;
                            font-size: 5px;
                        }
                    }
                }
                .off-text {
                    margin-top: 6px;
                }
                .live-time {
                    width: 50%;
                    margin: 6px auto 0;
                    span {
                        margin: 3px 3px 0;
                        font-size: 6px;
                    }
                }
            }
        }
        .live-tip {
            margin-bottom: 6px;
        }
    }
    .share-box {
        width: 16px;
        height: 16px;
        position: absolute;
        right: 8px;
        top: calc((100% - 12px) / 2);
        z-index: 1001;
        img {
            width: 100%;
        }
    }

}
</style>