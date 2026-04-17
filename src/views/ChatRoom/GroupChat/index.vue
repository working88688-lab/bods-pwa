<template>
    <div class="page-container" :style="{ 'min-height': height }">
        <Header
            color="#fff"
            textColor="#333333"
            :title="roomInfo.roomName"
            :right="userInfo.expand === 'true' ? '禁入/禁言' : ''"
            @onClickLeft="onBack"
            @onClickRight="onRoute('/forbidden')"
        />
        <Loading v-if="isInit" />
        <div v-else class="page-content">
            <MessageList :dialogueId="dialogueId" :roomInfo="roomInfo" @onShowOperate="handleShowOperate" />
            <ChatInput ref="ChatInputRef" :dialogueId="dialogueId" :roomInfo="roomInfo" />
        </div>
        <van-popup v-model:show="showOperatePopUp"  position="bottom" :style="{ height: '30%' }">
            <div class="pop-item" @click="handleAite">@TA</div>
            <div class="pop-item" @click="handleReply">回复TA</div>
            <template v-if="userInfo.expand === 'true'">
                <div class="pop-item" @click="handleSpeak">禁言</div>
                <div class="pop-item" @click="handleEnter">禁入</div>
                <div class="pop-item" @click="handleDelete">删除</div>
            </template>
            <div class="pop-item" @click="closePopUp">取消</div>
        </van-popup>
    </div>
</template>
<script>
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { joinRoom, disableSpeak, disableEnter, deleteHistory } from '@/apis/chat'
import { chatInfo } from '@/apis/user'
import { getQueryString } from '@/utils/tools'
import { Base64 } from 'js-base64'
import { Dialog } from 'vant'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import PubSub from 'pubsub-js'
import Loading from '@/components/Loading'

export default {
    name: 'GroupChat',
    components: {
        Header,
        Footer,
        Loading,
        MessageList,
        ChatInput
    },
    computed: {
        appFooter() {
            return this.$store.state.appFooter
        },
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        },
        userInfo() {
            return this.$store.state.userInfo
        },
        token() {
            return this.$store.state.token
        }
    },
    data() {
        return {
            isInit: true,
            dialogueId: null,
            roomInfo: {},
            pingData: JSON.stringify({ commandType: 'PING', sentTime: null, data: {}}),
            showOperatePopUp: false,
            operateData: null,
            height: window.innerHeight + 'px'
        }
    },
    created() {
        // this.init()
    },
    activated() {
        this.init()
    },
    mounted() {},
    beforeRouteLeave(to, from, next) {
        next()
    },
    destroyed() {},
    methods: {
        async init() {
            if (!this.userInfo || !this.userInfo.phoneNumber) {
                return this.$router.go(-1)
            }

            // 获取房间信息
            const { merchantAcct, roomType, roomId } = this.$route.query
            if (!merchantAcct || !roomType || !roomId) {
                return this.onBack()
            }

            this.isInit = true

            // 进入房间
            const res = await joinRoom({
                merchantAcct,
                roomType,
                roomId
            })
            if (res && res.code === 0) {
                const { canSpeak, merchantAcct, roomId, isOpen, roomAvatar, roomName, roomDesc, roomType, enterType, goldUnit, userLevel } = res.data.room
                this.roomInfo = {
                    roomId,
                    roomName,
                    roomAvatar,
                    roomDesc,
                    merchantAcct,
                    roomType,
                    canSpeak,
                    isOpen,
                    enterType,
                    goldUnit,
                    userLevel
                }
                this.dialogueId = res.data.dialogueId
                this.isInit = false
                
                // 请求加入房间
                this.handleJoinRoom()
            }
            // 清除未读消息状态
            this.$store.commit('SET_UNREADMESSAGET', false)
        },
        handleJoinRoom() {
            if (!this.roomInfo) {
                return null
            }
            this.$store.ws.send(
                JSON.stringify(
                    { 
                        commandType: 'JOIN_ROOM_REQ',
                        sentTime: null,
                        data: {
                            merchantAcct: this.roomInfo.merchantAcct,
                            roomId: this.roomInfo.roomId,
                            roomType: this.roomInfo.roomType
                        }
                })
            )
        },
        onBack() {
            this.$router.go(-1)
        },
        onRoute(path) {
            this.$router.push({
                path: path,
                query: {
                    roomId: this.roomInfo.roomId
                }
            })
        },
        handleShowOperate(data) {
            this.operateData = data
            this.showOperatePopUp = true
        },
        closePopUp() {
            this.showOperatePopUp = false
        },
        handleSpeak() {
            return Dialog.confirm({
                title: '提示',
                message: `您确定要将${this.operateData.fromUserInfo.nickName}禁言吗？`,
                className: 'confirm-dialog'
            }).then(async () => {
                this.closePopUp()
                const res = await disableSpeak({
                    merchantAcct: this.operateData.merchantAcct,
                    roomId: this.operateData.roomId,
                    userId: this.operateData.fromUserInfo.userId,
                    userCode: this.operateData.fromUserInfo.userAcct,
                    type: 1
                })
                if (res && res.code === 0) {
                    this.$toast('禁言成功')
                }
            }).catch(() => {})
        },
        handleEnter() {
            return Dialog.confirm({
                title: '提示',
                message: `您确定要将${this.operateData.fromUserInfo.nickName}禁入吗？`,
                className: 'confirm-dialog'
            }).then(async () => {
                this.closePopUp()
                const res = await disableEnter({
                    merchantAcct: this.operateData.merchantAcct,
                    roomId: this.operateData.roomId,
                    userId: this.operateData.fromUserInfo.userId,
                    userCode: this.operateData.fromUserInfo.userAcct,
                    type: 2
                })
                if (res && res.code === 0) {
                    this.$toast('禁入成功')
                }
            }).catch(() => {})
        },
        handleDelete() {
            return Dialog.confirm({
                title: '提示',
                message: `您确定要将${this.operateData.fromUserInfo.nickName}的消息删除吗？`,
                className: 'confirm-dialog'
            }).then(async () => {
                this.closePopUp()
                const res = await deleteHistory({
                    merchantAcct: this.operateData.merchantAcct,
                    dialogueId: this.operateData.dialogueId,
                    messageIds: [this.operateData.messageId],
                    chatType: 2
                })
                if (res && res.code === 0) {
                    this.$toast('删除成功')
                }
            }).catch(() => {})
        },
        handleAite() {
            this.$refs.ChatInputRef.showReply(1, this.operateData)
            this.closePopUp()
        },
        handleReply() {
            this.$refs.ChatInputRef.showReply(2, this.operateData)
            this.closePopUp()
        }
    }
};
</script>

<style lang="less" scoped>
.page-container {
    background: #fffafb;
}
.page-content {
    padding: 44px 0 56px;
    position: relative;
    overflow: hidden;
}

::v-deep .van-popup {
    background: #1d1d28;
    .pop-item {
        height: 60px;
        line-height: 60px;
        text-align: center;
        background: #292a38;
        color: #ebebeb;
    }
    .pop-item:last-child {
        background: #1d1d28;
    }
}
</style>