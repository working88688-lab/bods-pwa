<template>
  <div class="chat-content">
    <Loading v-if="isInit" />
    <template v-else>
      <vue-loadmore
        v-if="messageList.length"
        ref="my_scroller"
        :on-refresh="onLoad"
        class="message-list"
        refresh-text=""
      >
        <template v-if="messageList.length">
          <template v-for="(content, idx) in messageList">
            <div
              class="notify-item"
              v-if="content.type === 'NOTIFY'"
              :key="'NOTIFY' + idx"
            >
              欢迎<span>{{ content.joinUser.nickName }}</span
              >进入聊天室
            </div>
            <MessageItem
              v-else
              :key="'MessageItem' + idx"
              :messageInfo="content"
              :position="
                content.fromUserId === userInfo.userId ? 'right' : 'left'
              "
              @onImgLoad="handleImgLoad"
              @onShowOperate="handelShowOperate"
            />
          </template>
        </template>
      </vue-loadmore>
      <van-empty v-else description="暂无内容" />
    </template>
    <!-- <div class="unread" v-if="showUnReadMessageNum">
            <div class="unread-num">{{ unReadMessageNum > 99 ? '+99' : unReadMessageNum }}</div>
            <van-icon name="upgrade" />
        </div> -->
  </div>
</template>

<script>
import MessageItem from './MessageItem'
import PubSub from 'pubsub-js'
import { romHisList } from '@/apis/chat'
import _ from 'lodash'
import Loading from '@/components/Loading'

export default {
  name: 'MessageList',
  props: {
    dialogueId: {
      type: String,
      default: '',
    },
    roomInfo: {
      type: Object,
      default: function () {
        return {}
      },
    },
  },
  components: {
    Loading,
    MessageItem,
  },
  data() {
    return {
      messageList: [],
      pageData: {
        pageNo: 1,
        pageSize: 10,
      },
      finished: false,
      isInit: true,
      maxLength: 200,
      showUnReadMessageNum: true,
      unReadMessageNum: 100,
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
  },
  created() {
    this.getHistoryList(null, true)

    PubSub.subscribe('ROOM_CHAT', (msg, res) => {
      if (this.$route.path === '/groupChat') {
        if (res && res.code !== 0) {
          return this.$toast.fail(res.msg)
        }
        if (res.data && this.dialogueId === res.data.dialogueId) {
          const msgData = res.data
          const container = document.querySelector('.message-list')
          if (msgData.fromUserInfo.userId === this.userInfo.userId) {
            // 用户自己发送消息的时候，滚动到页面底部
            msgData['toBottom'] = true
            this.messageList.push(msgData)
            this.onScrollToBottom()
          } else {
            this.messageList.push(msgData)
            if (
              container.scrollHeight -
                container.clientHeight -
                container.scrollTop <
              100
            ) {
              this.onScrollToBottom()
            }
          }
          // 列表消息数超出上限
          if (this.messageList.length > this.maxLength) {
            this.messageList = this.messageList.splice(
              this.messageList.length - this.maxLength
            )
          }
        }
      }
    })
    PubSub.subscribe('DELETE_ROOM_MESSAGE', (msg, res) => {
      if (this.$route.path === '/groupChat') {
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
      if (this.$route.path === '/groupChat') {
        this.messageList.push({
          type: 'NOTIFY',
          joinUser: res.data.joinUser,
        })
        const container = document.querySelector('.message-list')
        if (
          container &&
          container.scrollHeight -
            container.clientHeight -
            container.scrollTop <
            100
        ) {
          this.onScrollToBottom()
        }
      }
    })
  },
  mounted() {},
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
    async getHistoryList(done, isInit) {
      const params = {
        ...this.pageData,
        merchantAcct: this.roomInfo.merchantAcct,
        dialogueId: this.dialogueId,
        chatType: 2,
      }
      const res = await romHisList(params).catch(() => {
        done && done()
      })
      done && done()
      if (res && res.code === 0) {
        this.messageList = res.data.reverse().concat(this.messageList)
        this.messageList.map(one => {
          if (one.mediaType === 7) {
            one.mediaInfo['liveImage'] =
              one.mediaInfo.anchor.previewUrlThumbBig ||
              one.mediaInfo.anchor.avatarUrl ||
              one.mediaInfo.anchor.previewUrl ||
              one.mediaInfo.anchor.previewUrlThumbSmall
          }
          return one
        })
        if (res.data.length < this.pageData.pageSize) {
          this.finished = true
        }
        if (isInit) {
          this.isInit = false
          this.onScrollToBottom()
          this.messageList.map(one => {
            one['toBottom'] = true
            return one
          })
        } else {
          // 跳转至数据加载之前的位置
          this.scrollInto(res.data.length)
        }
      }
    },
    onLoad(done) {
      if (!this.finished) {
        this.pageData.pageNo += 1
        this.getHistoryList(done, false)
      } else {
        done()
      }
    },
    handleImgLoad() {
      // this.onScrollToBottom()
    },
    handelShowOperate(data) {
      this.$emit('onShowOperate', data)
    },
    scrollInto(idx) {
      const targetData = this.messageList.slice(idx, idx + 1)
      if (targetData && targetData[0]) {
        this.$nextTick(() => {
          const targetDom = document.getElementById(
            'message-item_' + targetData[0].id
          )
          targetDom && targetDom.scrollIntoView()
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.chat-content {
  height: 100%;
}
.message-list {
  height: 100%;
  padding: 12px;
  overflow-y: auto;
  .notify-item {
    font-size: 12px;
    color: #8f8f94;
    text-align: center;
    margin: 6px 0;
    span {
      margin: 0 4px;
    }
  }
}
.unread {
  position: absolute;
  right: 16px;
  bottom: 76px;
  z-index: 99;
  padding-top: 8px;
  .unread-num {
    display: inline-block;
    width: 20px;
    height: 20px;
    font-size: 12px;
    text-align: center;
    line-height: 20px;
    border-radius: 50%;
    color: #ebebeb;
    background: #109fff;
    position: absolute;
    top: 0;
    right: 8px;
    z-index: 1;
  }
  i {
    font-size: 32px;
    transform: rotate(180deg);
  }
}
</style>
