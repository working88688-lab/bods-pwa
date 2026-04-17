
<template>
    <div class="live-chat" :class="{ 'is-horizontal': isHorizontal }">
        <div class="message-list">
            <template v-for="(content, idx) in messageList">
                <div class="notify-item" v-if="content.type === 'NOTIFY'" :key="'NOTIFY' + idx">
                    欢迎<span>{{ content.joinUser.nickName }}</span>进入直播间
                </div>
                <MessageItem v-else :chatInfo="content" :isHorizontal="isHorizontal" :key="'MessageItem' + idx" />
            </template>
        </div>
    </div>
</template>

<script>
import MessageItem from './MessageItem'
import PubSub from 'pubsub-js'

export default {
    name: 'LiveChat',
    components: {
        MessageItem
    },
    props: {
        roomInfo: {
            type: Object,
            default: null
        },
        isHorizontal: {
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            messageList: [],
            maxLength: 200
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        }
    },
    created() {
        PubSub.subscribe('ROOM_CHAT', (msg, res) => {
            if (this.$route.path === '/live') {
                if (res && res.code !== 0) {
                    return this.$toast.fail(res.msg)
                }
                if (res.data && this.roomInfo.mediaId === res.data.roomId) {
                    const msgData = res.data
                    const container = document.querySelector('.message-list')
                    if (msgData.fromUserInfo.userId === this.userInfo.userId) {
                        // 用户自己发送消息的时候，滚动到页面底部
                        msgData['toBottom'] = true
                        this.messageList.push(msgData)
                        this.onScrollToBottom()
                    } else {
                        this.messageList.push(msgData)
                        if (container.scrollHeight - container.clientHeight - container.scrollTop < 100) {
                            this.onScrollToBottom()
                        }
                    }
                    // 列表消息数超出上限
                    if (this.messageList.length > this.maxLength) {
                        this.messageList = this.messageList.splice(this.messageList.length - this.maxLength)
                    }
                }
            }
        })
        PubSub.subscribe('DELETE_ROOM_MESSAGE', (msg, res) => {
            if (this.$route.path === '/live') {
                if (res && res.messageIds) {
                    _.remove(this.messageList, one => {
                        return res.messageIds.indexOf(one.messageId) > -1
                    })
                    this.messageList = [].concat(this.messageList)
                }
            }
        })
        // 加入房间notify响应
        PubSub.subscribe('JOIN_ROOM_NOTIFY', (msg, res) => {
            if (this.$route.path === '/live') {
                if (res.data && this.roomInfo.mediaId === res.data.roomId) {
                    this.messageList.push({
                        type: 'NOTIFY',
                        joinUser: res.data.joinUser
                    })
                    const container = document.querySelector('.message-list')
                    if (container && (container.scrollHeight - container.clientHeight - container.scrollTop < 100)) {
                        this.onScrollToBottom()
                    }
                }
            }
        })
    },
    destroyed() {
        PubSub.unsubscribe('ROOM_CHAT')
        PubSub.unsubscribe('DELETE_ROOM_MESSAGE')
        PubSub.unsubscribe('JOIN_ROOM_NOTIFY')
    },
    methods: {
        onScrollToBottom() {
            this.$nextTick(() => {
                const container = document.querySelector('.message-list')
                if (container) {
                    container.scrollTop = container.scrollHeight
                }
            })
        },
        clearMessage() {
            this.messageList = []
        }
    }
}
</script>
<style lang="less" scoped>
.live-chat {
    width: 100%;
    overflow: hidden;
    position: absolute;
    left: 0;
    bottom: 44px;
    z-index: 1001;
    // &::after {
    //     content: '';
    //     width: 100%;
    //     height: 120px;
    //     background: linear-gradient(#1d1d28, rgba(0, 0, 0, 0));
    //     position: absolute;
    //     left: 0;
    //     top: 0;
    // }
    .message-list {
        height: 230px;
        padding: 16px 8px;
        overflow-x: hidden;
        overflow-y: auto;
        .chat-item:last-child {
            margin-bottom: 0;
        }
        &::-webkit-scrollbar {/*滚动条整体样式*/
            width: 0;
        }
        .notify-item {
            font-size: 12px;
            margin: 6px;
            span {
                margin: 0 4px;
            }
        }
    }
}
.live-chat.is-horizontal {
    width: 50%;
    bottom: 0;
    .message-list {
        height: 80vh;
        padding: 4px;
        .notify-item {
            font-size: 4px;
            margin: 3px;
            span {
                margin: 0 2px;
            }
        }
    }
}
</style>