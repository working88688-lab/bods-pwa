<template>
    <van-dialog v-model:show="showDialog" :class="{ 'is-horizontal': isHorizontal }" :showConfirmButton="false" :closeOnClickOverlay="true" @close="onClose">
        <div class="dialog-content">
            <div class="dialog-title">分享至群</div>
            <div class="chat-room-list">
                <div class="chat-room-item" v-for="(chatRoom, idx) in chatRoomList" :key="idx" @click="onShareMedia(chatRoom)">{{ chatRoom.room.roomName }}</div>
            </div>
        </div>
        <div class="dialog-footer">
            <img src="@/assets/images/icon_close.png" @click="onClose" alt="">
        </div>
    </van-dialog>
</template>

<script>
import { chatRoomList } from '@/apis/chat'

export default {
    name: 'ShareDialog',
    props: {
        isHorizontal: {
            type: Boolean,
            default() {
                return false
            }
        },
        shareData: {
            type: Object,
            default() {
                return null
            }
        }
    },
    data(){
        return {
            showDialog: true,
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        chatRoomList() {
            return this.$store.state.chatRoomList
        }
    },
    created() {},
    methods: {
        onShow() {
            this.showDialog = true
        },
        onClose() {
            this.$emit('onClose')
            this.showDialog = false
        },
        onShareMedia(room) {
            let messageData = {
                commandType: 'ROOM_CHAT',
                sentTime: null,
                data: {
                    merchantAcct: room.merchantAcct,
                    dialogueId: room.dialogueId,
                    chatType: 2,
                    roomType: room.room.roomType,
                    msgType: 6,
                    fromUserId: this.userInfo.userId,
                    roomId: room.roomId,
                    refererUserId: '',
                    refererMessageId: '',
                    mediaType: this.shareData.mediaType,
                    mediaId: this.shareData.mediaId,
                    content: null
                }
            }
            this.$store.ws.send(JSON.stringify(messageData))
            this.onClose()
            this.$toast('分享成功')
        }
    }
}
</script>

<style lang="less" scoped>
.van-dialog {
    background-color: transparent;
    border-radius: 0;
    max-width: 70vw;
    background: #fff;
    .dialog-content {
        text-align: center;
        border-radius: 8px;
        padding-bottom: 16px;
        .dialog-title {
            height: 60px;
            line-height: 60px;
            font-size: 20px;
        }
        .chat-room-list {
            .chat-room-item {
                height: 48px;
                line-height: 48px;
                font-size: 15px;
            }
        }
    }
    .dialog-footer {
        text-align: center;
        padding: 16px;
        img {
            display: inline-block;
            width: 32px;
            height: 32px; 
        }
    }
}
.van-dialog.is-horizontal {
    width: 30%;
    .van-dialog__content {
        .dialog-content {
            padding-bottom: 6px;
            .dialog-title {
                height: 20px;
                line-height: 20px;
                font-size: 8px;
            }
            .chat-room-list {
                .chat-room-item {
                    height: 20px;
                    line-height: 20px;
                    font-size: 7px;
                }
            }
        }
        .dialog-footer {
            padding: 2px;
            img {
                width: 12px;
                height: 12px;
            }
        }
    }
}
</style>